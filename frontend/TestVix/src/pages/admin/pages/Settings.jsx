import { useState } from 'react';

export default function Settings() {
    const [settings, setSettings] = useState({
        site_name: 'TestVix',
        default_public: true,
        allow_registration: true,
        notifications: true,
        maintenance: false,
    });
    const [saved, setSaved] = useState(false);

    const update = (key, value) => {
        setSettings({ ...settings, [key]: value });
        setSaved(false);
    };

    return (
        <div className="page page--narrow">
            <div className="panel">
                <div className="panel__header">
                    <h2 className="panel__title">Umumiy sozlamalar</h2>
                </div>
                <div className="settings">
                    <label className="form__field">
                        <span>Sayt nomi</span>
                        <input
                            value={settings.site_name}
                            onChange={(e) => update('site_name', e.target.value)}
                        />
                    </label>

                    <div className="settings__toggles">
                        {[
                            { key: 'default_public', label: 'Yangi testlar sukut boyicha ochiq bolsin' },
                            { key: 'allow_registration', label: "Royxatdan otishga ruxsat berish" },
                            { key: 'notifications', label: 'Email bildirishnomalar' },
                            { key: 'maintenance', label: 'Texnik xizmat rejimi' },
                        ].map(({ key, label }) => (
                            <label className="toggle" key={key}>
                                <input
                                    type="checkbox"
                                    checked={settings[key]}
                                    onChange={(e) => update(key, e.target.checked)}
                                />
                                <span className="toggle__track">
                                    <span className="toggle__thumb" />
                                </span>
                                <span className="toggle__label">{label}</span>
                            </label>
                        ))}
                    </div>

                    <div className="form__footer">
                        {saved && <span className="settings__saved">Saqlandi ✓</span>}
                        <button className="btn btn--primary" onClick={() => setSaved(true)}>
                            Saqlash
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}