// import React from 'react'
import { Excalidraw } from "@excalidraw/excalidraw";
import { exportToSvg } from "@excalidraw/utils";
import { useContext, useEffect, useRef, useState } from "react";

import "@excalidraw/excalidraw/index.css";
import { ThemeContext } from "../../context/ThemeContext";




export const renderSvg = async ({ json, setSVG, theme }) => {
  // const { theme, toggleTheme } = useContext(ThemeContext);
  console.log('svg_sjon');
  
  try {
    const parsed = JSON.parse(json);
    const elements = (parsed.elements || [])
      .filter((element) => !element.isDeleted)
      .map((element) => ({
        ...element,
        strokeColor:
          theme=='dark' && element.strokeColor === "#1e1e1e"
            ? "#ffffff"
            : element.strokeColor,
      }));

    // const elements = (parsed.elements || []).filter(
    //   (element) => !element.isDeleted
    // );

    const svgEl = await exportToSvg({
      elements,
      appState: {
        exportBackground: false,
      },
      files: {},
    });

    svgEl.removeAttribute("width");
    svgEl.removeAttribute("height");

    svgEl.setAttribute("width", "100%");
    svgEl.style.height = "auto";


    svgEl.style.display = "block";
    svgEl.style.maxWidth = "350px";
    svgEl.style.height = "auto";

    setSVG(svgEl.outerHTML);
  } catch (err) {
    console.error(err);
    alert("JSON noto'g'ri");
  }
};

export default function SVGShow({ svg, setSVG, json }) {
  const { theme, toggleTheme } = useContext(ThemeContext);
  useEffect(() => {
    if (json) {
      renderSvg({ json, setSVG, theme });
    }
  }, [json, theme]);

  return (
    <div
      style={{
        // background: theme == 'light'? "#fff":'#021f3f',
        padding: 20,
        marginTop:20,
        marginBottom:20,
        width: "1fr",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
      dangerouslySetInnerHTML={{
        __html: svg,
      }}
    />
  );
}









// export const renderSvg = async ({json, setSVG}) => {
//         try {
//           const parsed = JSON.parse(json);
    
//           const svgEl = await exportToSvg({
//             elements: parsed.elements || [],
//             appState: {
//               exportBackground: true,
//             },
//             files: {},
//           });
    
//           setSVG(svgEl.outerHTML);
//         } catch (err) {
//           console.error(err);
//           alert("JSON noto'g'ri");
//         }
//       };


// export default function SVGShow({svg, setSVG, json}) {
//   useEffect(() => {
    
//     if(json){
//       setTimeout(() => {
//         renderSvg({json, setSVG});
//       }, 100);
//     }
//   }, [json]);
    
//   return (
//     <div
//         style={{
//           background: "#fff",
//           overflow: "auto",
//           padding: 20,
//         }}
//         dangerouslySetInnerHTML={{
//           __html: svg,
//         }}
//       />
//   )
// }
