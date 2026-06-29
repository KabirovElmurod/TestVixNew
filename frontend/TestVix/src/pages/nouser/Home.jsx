import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import FonColor from "../../components/ui/FonColor";

export default function Home() {
  const { token, logout } = useContext(AuthContext);
  const [testResult, setTestResult] = useState(null);
  console.log('salom');
  
  const steps = [
    {
      id: "1",
      icon: "📝",
      title: "Test ishlang",
      desc: "Minglab testlar orasidan tanlang yoki o‘zingiz yarating"
    },
    {
      id: "2",
      icon: "⚔️",
      title: "Challenge qiling",
      desc: "Do‘stlaringiz bilan real-time battle qiling"
    },
    {
      id: "3",
      icon: "🏆",
      title: "Reytingda chiqing",
      desc: "Eng kuchlilar qatoriga kiring"
    }
  ];

  const features = [
    { icon: "⚔️", title: "Real-time challenge", desc: "Do‘stlaringiz bilan bir vaqtda test ishlang" },
    { icon: "🏆", title: "Reyting tizimi", desc: "Har bir test sizni yuqoriga olib chiqadi" },
    { icon: "📈", title: "Progress", desc: "O‘sishingizni kuzating" },
    { icon: "👥", title: "Community", desc: "Yolg‘iz emas, birga o‘rganing" }
  ];

  const handleSampleTest = (val) => setTestResult(val === 4 ? "correct" : "wrong");

  return (
    <div className="home-container">
      <FonColor lightColor="#279af8" darkColor="#054298" top_y={100} left_x={-250} className="fon_color_1" />
      <FonColor lightColor="#6366f1" darkColor="#312e81" top_y={400} left_x={600} wd={400} ht={400} className="fon_color_1" />
      
      <div className="home-content">
        <div className="hero-section">
          <h1 className="home-title">⚔️ Test orqali raqobat qiling. Bilimingizni oshiring.</h1>
          <p className="home-subtitle">
            Do‘stlaringiz bilan challenge qiling, rankingda yuqoriga chiqing va o‘qishni qiziqarli qiling.
          </p>
          <div className="home-buttons">
            <Link to="/register" className="btn btn-primary">🚀 Boshlash</Link>
            <Link to="/login" className="btn btn-secondary">⚡ Demo ko‘rish</Link>
          </div>
        </div>

        <div className="section-divider"></div>

        <div className="how-it-works" id="qanday_ishlaydi">
          <h2 className="section-title">QANDAY ISHLAYDI?</h2>
          <div className="steps-grid">
            {steps.map((step, index) => (
              <div key={step.id} className="step-card-container">
                <FonColor 
                  lightColor={index === 0 ? "#279af8" : index === 1 ? "#6366f1" : "#4ecdc4"} 
                  darkColor={index === 0 ? "#054298" : index === 1 ? "#312e81" : "#00b894"} 
                  top_y={600} left_x={index * 300 - 300} wd={200} ht={200} 
                />
                <div className="step-card">
                <div className="step-icon">{step.icon}</div>
                <div className="step-info">
                  <span className="step-number">{step.id}-qadam</span>
                  <h3 className="step-title">{step.title}</h3>
                  <p className="step-desc">{step.desc}</p>
                </div>
              </div>
              </div>
            ))}
          </div>
        </div>

        <div className="section-divider"></div>

        {/* 3 & 4. Live & Leaderboard Preview */}
        <div className="preview-grid" id='top_users'>
          <div className="live-battle-card">
            <h2 className="section-title">🔥 LIVE BATTLE</h2>
            <div className="live-list">
              <div className="live-item"><span>👤 Javohir</span> <span>850 pts</span></div>
              <div className="live-item"><span>👤 Sardor</span> <span>720 pts</span></div>
              <div className="live-item pulse"><span>👤 Malika</span> <span>690 pts</span></div>
            </div>
            <p className="mt-4">Hozir live battle ketmoqda!</p>
            <Link to="/login" className="btn btn-primary btn-sm">Qo‘shilish</Link>
          </div>

          <div className="leaderboard-mini">
            <h2 className="section-title">🏆 TOP USERS</h2>
            <table className="mini-table">
              <thead>
                <tr><th>#</th><th>User</th><th>Score</th></tr>
              </thead>
              <tbody>
                <tr><td>1</td><td>Aziz</td><td>2450</td></tr>
                <tr><td>2</td><td>Nodira</td><td>2300</td></tr>
                <tr><td>3</td><td>Jasur</td><td>2150</td></tr>
              </tbody>
            </table>
            <p className="hint-text">“Men ham chiqamanmi?” deb o‘ylayapsizmi?</p>
          </div>
        </div>

        <div className="section-divider"></div>

        {/* 5. Emotional Features */}
        <div className="emotional-features" id='talim'>
          <h2 className="section-title">ODDIY EMAS, JONLI TA'LIM</h2>
          <div className="features-grid">
            {features.map((f, i) => (
              <div key={i} className="feature-item">
                <span className="feature-icon">{f.icon}</span>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="section-divider"></div>

        {/* 6. Sample Test */}
        <div className="sample-test-section">
          <div className="interactive-card">
            <FonColor lightColor="#f59e0b" darkColor="#d97706" top_y={0} left_x={0} wd={150} ht={150} />
            <h3>🧪 Sinab ko'ring</h3>
            <p className="question">Savol: 2 + 2 = ?</p>
            <div className="options">
              {[3, 4, 5].map(val => (
                <button key={val} onClick={() => handleSampleTest(val)} className="opt-btn">{val}</button>
              ))}
            </div>
            {testResult && (
              <div className={`result-msg ${testResult}`}>
                {testResult === "correct" ? "✅ To'g'ri! Shunaqa testlar sizni kutmoqda" : "❌ Xato, lekin harakat qiling!"}
                <br />
                <Link to="/login" className="link">Davom etish uchun kiring 👉</Link>
              </div>
            )}
          </div>
        </div>

        <div className="section-divider"></div>

        {/* 7 & 8. Target Audience */}
        {/* <div className="audience-grid">
          <div className="audience-card">
            <h3>👨‍🏫 USTOZLAR UCHUN</h3>
            <ul>
              <li>Studentlarni boshqarish</li>
              <li>Natijani kuzatish</li>
              <li>Oson test yaratish</li>
            </ul>
            <button className="btn btn-secondary">Batafsil</button>
          </div>
          <div className="audience-card">
            <h3>👨‍👩‍👧 OTA-ONALAR UCHUN</h3>
            <ul>
              <li>Rivojlanishni kuzatish</li>
              <li>Haqiqiy natijalar</li>
              <li>Kundalik faollik</li>
            </ul>
            <button className="btn btn-secondary">Kuzatish</button>
          </div>
        </div> */}

        {/* 9 & 10. Mobile & Proof */}
        {/* <div className="proof-section">
          <div className="mobile-preview">
            <div className="phone-mockup">
              <div className="screen">📱 TestVix Mobile UI</div>
            </div>
            <p>Yoshlar uchun qulay mobil interfeys</p>
          </div>
          <div className="social-proof">
            <div className="stat"><h2>1000+</h2><p>USERLAR</p></div>
            <div className="stat"><h2>5000+</h2><p>TESTLAR</p></div>
          </div>
        </div> */}

        {/* <div className="section-divider"></div> */}

        {/* 11. Final CTA */}
        <div className="final-cta">
          <h2>🚀 HOZIR BOSHLANG</h2>
          <div className="home-buttons">
            <Link to="/register" className="btn btn-primary">Ro'yxatdan o'tish</Link>
            <Link to="/login" className="btn btn-secondary">Kirish</Link>
          </div>
        </div>

        {/* 12. Footer */}
        <footer className="home-footer">
          <div className="footer-links">
            <Link to="/about">Biz haqimizda</Link>
            <Link to="/contact">Kontakt</Link>
            <a href="https://t.me/testvix">Telegram</a>
            <a href="https://instagram.com/testvix">Instagram</a>
            <Link to="/terms">Qoidalar</Link>
          </div>
          <p className="copy">© 2024 TestVix. Barcha huquqlar himoyalangan.</p>
        </footer>

      </div>
    </div>
  );
}