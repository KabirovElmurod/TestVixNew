import { useState, useEffect } from 'react';

// Oyna kengligini kuzatuvchi maxsus xuk
function useWindowWidth() {
    const [width, setWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth);

        // Oyna oʻlchami oʻzgarganda handleResize funksiyasini ishga tushiramiz
        window.addEventListener('resize', handleResize);

        // Komponent oʻchirilganda (unmount) xotirani tozalaymiz
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return width;
}

// Istalgan div ichida ishlatilishi
export default function MyComponent() {
    const width = useWindowWidth();

    return (
        <div className="tashqi-konteyner" style={{ padding: '20px', border: '1px solid black' }}>
            <h3>Asosiy sahifa</h3>
            {console.log('sssss')
            }
            {/* Har qanday ichki div ichida ham toʻgʻri ishlaydi */}
            <div className="ichki-blok" style={{ background: '#f0f0f0', padding: '10px' }}>
                <p>Hozirgi oyna kengligi: **{width}px**</p>

                {width < 768 ? (
                    <p>Siz mobil qurilmadasiz</p>
                ) : (
                    <p>Siz kompyuter ekrandasiz</p>
                )}
            </div>
        </div>
    );
}
