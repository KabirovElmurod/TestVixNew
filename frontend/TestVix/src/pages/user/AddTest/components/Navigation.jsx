import React from 'react';
import { nav_items } from './nav';

const Navigation = ({ activeTab, setActiveTab, setIsJson }) => {
    return (
        <div className='add_test_navigation'>
            {nav_items.map((item) => (
                <button
                    key={item.id}
                    className={`nav_button ${activeTab === item.id ? 'active' : ''}`}
                    onClick={() => {
                        setActiveTab(item.id);
                        setIsJson(item.id === 'json');
                    }}
                >
                    {item.label}
                </button>
            ))}
        </div>
    );
};

export default Navigation;
