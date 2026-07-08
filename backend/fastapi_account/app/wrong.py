def wrong(message:str, status:bool, data:dict={}):
    return {"message": message, "status": status, "data": data}