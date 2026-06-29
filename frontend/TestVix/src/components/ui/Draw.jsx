// import React from 'react'
import { Excalidraw } from "@excalidraw/excalidraw";
import { exportToSvg } from "@excalidraw/utils";
import { useEffect, useRef, useState } from "react";

import "@excalidraw/excalidraw/index.css";
import { renderSvg } from "./SVGShow";
const normalize = (str) => {
  try {
    return JSON.stringify(JSON.parse(str));
  } catch {
    return str;
  }
};
export default function Draw({json, setJSON, setSVG, state, setState}) {
    const apiRef = useRef(null);
    const getJson = () => {
      
        if (!apiRef.current) return;

        const elements = apiRef.current.getSceneElements();
        let js = JSON.stringify({elements}, null, 2)
        console.log('a');
        
        if (state){
          setState(prev => ({
            ...prev,
            is_svg_json_edit: normalize(prev.svg_json) != normalize(js)
          }));
        }
        setJSON(js);
        
    };


     const loadJsonToCanvas = (api) => {
        // try {
            const parsed = JSON.parse(json);
            
            if (!api) return;
            if (!apiRef.current) return;
            setTimeout(() => {
            apiRef.current.updateScene({
            elements: parsed.elements || [],
            });
            }, 500);
            
        };

        const timeoutRef = useRef();
        const timeoutSVG = useRef();

       const handleChange = (elements) => {
          clearTimeout(timeoutRef.current);
          clearTimeout(timeoutSVG.current);

          timeoutRef.current = setTimeout(() => {
            const js = JSON.stringify({ elements }, null, 2);

            setJSON(js);

            if (state) {
              setState(prev => ({
                ...prev,
                is_svg_json_edit: normalize(prev.svg_json) !== normalize(js)
              }));
            }

            timeoutSVG.current = setTimeout(() => {
              renderSvg({ json: js, setSVG });
            }, 0);

          }, 300);
        };
  return (
    <div style={{
        height:'70vh',
        width:'100%',
    }}>
        <Excalidraw
        onChange={(elements)=>{
            handleChange(elements)
        }}
          excalidrawAPI={(api) => {
            apiRef.current = api;
            loadJsonToCanvas(api);
            renderSvg({json, setSVG});
          }}
          UIOptions={{
            canvasActions: {
              loadScene: false,
              export: false,
              saveAsImage: false,
            },
            tools: {
              image: false,
            },
          }}
        />
    </div>
  )
}
