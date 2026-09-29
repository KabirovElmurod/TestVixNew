from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Set
import json
import asyncio
from datetime import datetime

from ..session import get_db
from ..core.security import get_current_user_ws
from ..redis.redis import get_redis, add_room_message, get_room_messages, get_room_message_size, flush_room_messages_to_db
# from ...app.core.security import get_current_user
router = APIRouter(prefix="/ws", tags=["WebSocket"])

# Active connections: {room_id: {websocket: user_info}}
active_connections: Dict[int, Dict[WebSocket, dict]] = {}

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, Dict[WebSocket, dict]] = {}

    async def connect(self, websocket: WebSocket, room_id: int, user_info: dict):
        await websocket.accept()
        if room_id not in self.active_connections:
            self.active_connections[room_id] = {}
        self.active_connections[room_id][websocket] = user_info

    def disconnect(self, websocket: WebSocket, room_id: int):
        if room_id in self.active_connections:
            self.active_connections[room_id].pop(websocket, None)
            if not self.active_connections[room_id]:
                del self.active_connections[room_id]

    async def broadcast(self, room_id: int, message: dict):
        if room_id in self.active_connections:
            disconnected = []
            for websocket in self.active_connections[room_id]:
                try:
                    await websocket.send_json(message)
                except:
                    disconnected.append(websocket)

            for ws in disconnected:
                self.disconnect(ws, room_id)

manager = ConnectionManager()

@router.websocket("/room/{room_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    room_id: int,
    # token: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user_ws)
):
    # User authentication
    try:
        # user_info = await get_current_user_ws(token)
        if not current_user or current_user.get('status') == False:
            await websocket.close(code=1008, reason="Unauthorized")
            return
    except Exception as e:
        await websocket.close(code=1008, reason="Unauthorized")
        return

    await manager.connect(websocket, room_id, current_user)
    print(f'\n\n\current_user=> {current_user} \n\n\n')
    try:
        # Send chat history to new user
        redis = await get_redis()
        history = await get_room_messages(room_id)
        if history:
            await websocket.send_json({
                "type": "history",
                "messages": history[::-1]
            })

        # Send user joined notification
        await manager.broadcast(room_id, {
            "type": "user_joined",
            "user": current_user.get('sub'),
            "user_id": current_user.get('id'),
            "timestamp": datetime.now().isoformat()
        })

        # Message batching task
        last_flush = datetime.now()
        while True:
            data = await websocket.receive_json()

            if data.get("type") == "message":
                message_data = {
                    "room_id": room_id,
                    "user_id": current_user.get('id'),
                    "username": current_user.get('sub'),
                    "text": data.get("text"),
                    "created": datetime.now().isoformat()
                }
                print(f'\n\n\nmessage=> {message_data} \n\n\n')

                # Add to Redis
                await add_room_message(room_id, message_data)

                # Broadcast to all users in room
                await manager.broadcast(room_id, {
                    "type": "message",
                    **message_data
                })

                # Check if we need to flush to DB (5 minutes or 100MB)
                current_time = datetime.now()
                message_size = await get_room_message_size(room_id)

                time_elapsed = (current_time - last_flush).total_seconds()
                if time_elapsed >= 300 or message_size >= 100 * 1024 * 1024:  # 5 min or 100MB
                    await flush_room_messages_to_db(room_id, db)
                    last_flush = current_time

    except WebSocketDisconnect:
        manager.disconnect(websocket, room_id)
        await manager.broadcast(room_id, {
            "type": "user_left",
            "user": current_user.get('sub'),
            "user_id": current_user.get('id'),
            "timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        manager.disconnect(websocket, room_id)

