import React, { useEffect, useState, useContext, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getTestStatisticsByDateRange, getTestTopResults } from '../../api/request_testlar';
import { AuthContext } from '../../context/AuthContext';
import Title from '../../components/ui/Title';
import Message from '../../components/ui/Message';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType } from 'docx';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
// const Uzbek = require("flatpickr/dist/l10n/uz.js").default.uz;
import { Uzbek } from 'flatpickr/dist/l10n/uz';

export default function TestStatistics() {
  const location = useLocation();
  const navigate = useNavigate();
  const [statistics, setStatistics] = useState([]);
  const [topResults, setTopResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingTop, setLoadingTop] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [testId, setTestId] = useState(null);
  const [testName, setTestName] = useState('');
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [startHour, setStartHour] = useState('');
  const [endHour, setEndHour] = useState('');
  const { user, logout } = useContext(AuthContext);

  const startDateRef = useRef(null);
  const endDateRef = useRef(null);
  const startTimeRef = useRef(null);
  const endTimeRef = useRef(null);

  useEffect(() => {
    if (startDateRef.current) {
      flatpickr(startDateRef.current, {
        dateFormat: 'Y-m-d',
        locale: Uzbek,
        onChange: (selectedDates, dateStr) => {
          setStartDate(dateStr);
        }
      });
    }
    if (endDateRef.current) {
      flatpickr(endDateRef.current, {
        dateFormat: 'Y-m-d',
        locale: Uzbek,
        onChange: (selectedDates, dateStr) => {
          setEndDate(dateStr);
        }
      });
    }
    if (startTimeRef.current) {
      flatpickr(startTimeRef.current, {
        enableTime: true,
        noCalendar: true,
        dateFormat: 'H:i',
        locale: Uzbek,
        onChange: (selectedDates, dateStr) => {
          setStartHour(dateStr);
        }
      });
    }
    if (endTimeRef.current) {
      flatpickr(endTimeRef.current, {
        enableTime: true,
        noCalendar: true,
        dateFormat: 'H:i',
        locale: Uzbek,
        onChange: (selectedDates, dateStr) => {
          setEndHour(dateStr);
        }
      });
    }
  }, []);

  useEffect(() => {
    if (location.state?.test_id) {
      setTestId(location.state.test_id);
      setTestName(location.state.test_name || 'Test');
    }
  }, [location.state]);

  useEffect(() => {
    if (testId) {
      fetchStatistics();
      fetchTopResults();
    }
  }, [testId]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const res = await getTestStatisticsByDateRange(testId, startDate, endDate, startHour, endHour);
      if (res.user === false) {
        logout();
        window.location.href = '/';
        return;
      }
      setStatistics(Array.isArray(res) ? res : []);
    } catch (error) {
      console.error('Statistics fetch error:', error);
      setMessage('Statistikani yuklashda xatolik yuz berdi');
      setMessageType('error');
      setStatistics([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopResults = async () => {
    try {
      setLoadingTop(true);
      const res = await getTestTopResults(testId, 100);
      if (res.user === false) {
        logout();
        window.location.href = '/';
        return;
      }
      setTopResults(Array.isArray(res) ? res : []);
    } catch (error) {
      console.error('Top results fetch error:', error);
      setTopResults([]);
    } finally {
      setLoadingTop(false);
    }
  };

  const handleCloseMessage = () => {
    setMessage('');
  };

  const formatTime = (seconds) => {
    if (!seconds) return '0 daqiqa';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return minutes > 0 ? `${minutes} daqiqa ${secs} soniya` : `${secs} soniya`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const downloadTXT = () => {
    let content = `Test Natijalari Statistikasi - ${testName}\n`;
    content += '='.repeat(50) + '\n\n';
    content += `Test ID: ${testId}\n`;
    content += `Sana oraliq: ${startDate} - ${endDate}\n`;
    content += `Soat oraliq: ${startHour} - ${endHour}\n`;
    content += `Yuklash vaqti: ${new Date().toLocaleDateString('uz-UZ')}\n\n`;
    content += '-'.repeat(50) + '\n\n';

    statistics.forEach((stat, index) => {
      content += `${index + 1}. Foydalanuvchi: ${stat.nickname}\n`;
      content += `   Jami savollar: ${stat.total_questions}\n`;
      content += `   To'g'ri javoblar: ${stat.correct_answers}\n`;
      content += `   Xato javoblar: ${stat.wrong_answers}\n`;
      content += `   Sarflangan vaqt: ${formatTime(stat.time_spent)}\n`;
      content += `   Sana: ${formatDate(stat.created)}\n\n`;
    });

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `test_statistics_${testId}_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadExcel = () => {
    const data = statistics.map((stat, index) => ({
      '#': index + 1,
      'Test ID': testId,
      'Test nomi': stat.test_name,
      'Fan': stat.test_fan,
      'Foydalanuvchi': stat.nickname,
      'Jami savollar': stat.total_questions,
      "To'g'ri javoblar": stat.correct_answers,
      'Xato javoblar': stat.wrong_answers,
      'Sarflangan vaqt (soniya)': stat.time_spent,
      'Sana': formatDate(stat.created)
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Statistika');
    XLSX.writeFile(wb, `test_statistics_${testId}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const downloadWord = async () => {
    const tableRows = [
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph('#')] }),
          new TableCell({ children: [new Paragraph('Test ID')] }),
          new TableCell({ children: [new Paragraph('Test nomi')] }),
          new TableCell({ children: [new Paragraph('Fan')] }),
          new TableCell({ children: [new Paragraph('Foydalanuvchi')] }),
          new TableCell({ children: [new Paragraph('Jami savollar')] }),
          new TableCell({ children: [new Paragraph("To'g'ri")] }),
          new TableCell({ children: [new Paragraph('Xato')] }),
          new TableCell({ children: [new Paragraph('Vaqt')] }),
          new TableCell({ children: [new Paragraph('Sana')] }),
        ],
      }),
      ...statistics.map((stat, index) =>
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph(String(index + 1))] }),
            new TableCell({ children: [new Paragraph(String(testId))] }),
            new TableCell({ children: [new Paragraph(stat.test_name)] }),
            new TableCell({ children: [new Paragraph(stat.test_fan)] }),
            new TableCell({ children: [new Paragraph(stat.nickname)] }),
            new TableCell({ children: [new Paragraph(String(stat.total_questions))] }),
            new TableCell({ children: [new Paragraph(String(stat.correct_answers))] }),
            new TableCell({ children: [new Paragraph(String(stat.wrong_answers))] }),
            new TableCell({ children: [new Paragraph(formatTime(stat.time_spent))] }),
            new TableCell({ children: [new Paragraph(formatDate(stat.created))] }),
          ],
        })
      ),
    ];

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              text: `Test Natijalari Statistikasi - ${testName}`,
              heading: 'Heading1',
            }),
            new Paragraph(`Test ID: ${testId}`),
            new Paragraph(`Sana oraliq: ${startDate} - ${endDate}`),
            new Paragraph(`Soat oraliq: ${startHour} - ${endHour}`),
            new Paragraph(`Yuklash vaqti: ${new Date().toLocaleDateString('uz-UZ')}`),
            new Paragraph(''),
            new Table({
              rows: tableRows,
              width: { size: 100, type: WidthType.PERCENTAGE },
            }),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `test_statistics_${testId}_${new Date().toISOString().split('T')[0]}.docx`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleApplyFilter = () => {
    fetchStatistics();
  };

  const chartData = statistics.map((stat, index) => ({
    index: index + 1,
    correct: stat.correct_answers,
    wrong: stat.wrong_answers,
    time: Math.round(stat.time_spent / 60),
    date: new Date(stat.created).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit' })
  }));

  const summaryStats = statistics.length > 0 ? {
    totalAttempts: statistics.length,
    avgCorrect: Math.round(statistics.reduce((sum, s) => sum + s.correct_answers, 0) / statistics.length),
    avgWrong: Math.round(statistics.reduce((sum, s) => sum + s.wrong_answers, 0) / statistics.length),
    avgTime: Math.round(statistics.reduce((sum, s) => sum + s.time_spent, 0) / statistics.length / 60)
  } : null;

  return (
    <>
      <Message
        type={messageType}
        message={message}
        onClose={handleCloseMessage}
        duration={3000}
      />
      <div className='test_statistics_page'>
        <div className='statistics_header'>
          <Title title={`${testName} - Statistika`}></Title>
          <div className='download_buttons'>
            <button className='btn btn-outline' onClick={downloadTXT}>
              <i className='bi bi-file-text'></i> TXT
            </button>
            <button className='btn btn-outline' onClick={downloadExcel}>
              <i className='bi bi-file-earmark-excel'></i> Excel
            </button>
            <button className='btn btn-outline' onClick={downloadWord}>
              <i className='bi bi-file-earmark-word'></i> Word
            </button>
          </div>
        </div>

        <div className='statistics_content'>
          <div className='filter_section'>
            <div className='filter_group'>
              <label>Dan (sana):</label>
              <input
                ref={startDateRef}
                type='text'
                placeholder='Sana tanlang'
                className='date_picker flatpickr-input'
              />
            </div>
            <div className='filter_group'>
              <label>Gacha (sana):</label>
              <input
                ref={endDateRef}
                type='text'
                placeholder='Sana tanlang'
                className='date_picker flatpickr-input'
              />
            </div>
            <div className='filter_group'>
              <label>Dan (vaqt):</label>
              <input
                ref={startTimeRef}
                type='text'
                placeholder='Vaqt tanlang'
                className='time_picker flatpickr-input'
              />
            </div>
            <div className='filter_group'>
              <label>Gacha (vaqt):</label>
              <input
                ref={endTimeRef}
                type='text'
                placeholder='Vaqt tanlang'
                className='time_picker flatpickr-input'
              />
            </div>
            <button className='btn btn-primary' onClick={handleApplyFilter}>
              <i className='bi bi-filter'></i> Filtrlash
            </button>
          </div>

          {summaryStats && (
            <div className='summary_cards'>
              <div className='summary_card'>
                <div className='card_icon'>
                  <i className='bi bi-clipboard-data'></i>
                </div>
                <div className='card_content'>
                  <h4>Jami urinishlar</h4>
                  <p>{summaryStats.totalAttempts}</p>
                </div>
              </div>
              <div className='summary_card'>
                <div className='card_icon'>
                  <i className='bi bi-check-circle'></i>
                </div>
                <div className='card_content'>
                  <h4>O'rtacha to'g'ri</h4>
                  <p>{summaryStats.avgCorrect}</p>
                </div>
              </div>
              <div className='summary_card'>
                <div className='card_icon'>
                  <i className='bi bi-x-circle'></i>
                </div>
                <div className='card_content'>
                  <h4>O'rtacha xato</h4>
                  <p>{summaryStats.avgWrong}</p>
                </div>
              </div>
              <div className='summary_card'>
                <div className='card_icon'>
                  <i className='bi bi-clock'></i>
                </div>
                <div className='card_content'>
                  <h4>O'rtacha vaqt (daq)</h4>
                  <p>{summaryStats.avgTime}</p>
                </div>
              </div>
            </div>
          )}

          <div className='chart_section'>
            <h3>Ishlash grafigi (To'g'ri/Xato javoblar)</h3>
            <p className='chart-description'>
              Bu grafik tanlangan sana va soat oraliqida foydalanuvchilarning to'g'ri va xato javoblarini ko'rsatadi.
              Yashil chiziq - to'g'ri javoblar, Qizil chiziq - xato javoblar.
            </p>
            {loading ? (
              <div className='loading'>Yuklanmoqda...</div>
            ) : statistics.length === 0 ? (
              <div className='empty_state'>
                <i className='bi bi-bar-chart'></i>
                <p>Bu oraliqda natijalar yo'q</p>
              </div>
            ) : (
              <div className='chart_container'>
                <ResponsiveContainer width='100%' height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='date' />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type='monotone' dataKey='correct' stroke='#10b981' name="To'g'ri javoblar" />
                    <Line type='monotone' dataKey='wrong' stroke='#ef4444' name="Xato javoblar" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className='chart_section'>
            <h3>Vaqt grafigi (Sarflangan vaqt)</h3>
            <p className='chart-description'>
              Bu grafik tanlangan sana va soat oraliqida har bir urinish uchun sarflangan vaqtni (daqiqalarda) ko'rsatadi.
              Shunchaki testni tugatish uchun qancha vaqt sarflanganini ko'rishingiz mumkin.
            </p>
            {loading ? (
              <div className='loading'>Yuklanmoqda...</div>
            ) : statistics.length === 0 ? (
              <div className='empty_state'>
                <i className='bi bi-bar-chart'></i>
                <p>Bu oraliqda natijalar yo'q</p>
              </div>
            ) : (
              <div className='chart_container'>
                <ResponsiveContainer width='100%' height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='date' />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey='time' fill='#667eea' name="Sarflangan vaqt (daqiqa)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className='table_section'>
            <h3>Natijalar ({statistics.length})</h3>
            {loading ? (
              <div className='loading'>Yuklanmoqda...</div>
            ) : statistics.length === 0 ? (
              <div className='empty_state'>
                <i className='bi bi-table'></i>
                <p>Bu oraliqda natijalar yo'q</p>
              </div>
            ) : (
              <div className='table_container'>
                <table className='statistics_table'>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Foydalanuvchi</th>
                      <th>Jami</th>
                      <th>To'g'ri</th>
                      <th>Xato</th>
                      <th>Vaqt</th>
                      <th>Sana</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statistics.map((stat, index) => (
                      <tr key={stat.id}>
                        <td>{index + 1}</td>
                        <td>{stat.nickname}</td>
                        <td>{stat.total_questions}</td>
                        <td className='correct'>{stat.correct_answers}</td>
                        <td className='wrong'>{stat.wrong_answers}</td>
                        <td>{formatTime(stat.time_spent)}</td>
                        <td>{formatDate(stat.created)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className='table_section'>
            <h3>Top 100 natija</h3>
            {loadingTop ? (
              <div className='loading'>Yuklanmoqda...</div>
            ) : topResults.length === 0 ? (
              <div className='empty_state'>
                <i className='bi bi-trophy'></i>
                <p>Hali natijalar yo'q</p>
              </div>
            ) : (
              <div className='table_container'>
                <table className='statistics_table'>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Foydalanuvchi</th>
                      <th>Jami</th>
                      <th>To'g'ri</th>
                      <th>Xato</th>
                      <th>Vaqt</th>
                      <th>Sana</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topResults.map((stat, index) => (
                      <tr key={stat.id}>
                        <td className={index < 3 ? 'top-rank' : ''}>{index + 1}</td>
                        <td>{stat.nickname}</td>
                        <td>{stat.total_questions}</td>
                        <td className='correct'>{stat.correct_answers}</td>
                        <td className='wrong'>{stat.wrong_answers}</td>
                        <td>{formatTime(stat.time_spent)}</td>
                        <td>{formatDate(stat.created)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
