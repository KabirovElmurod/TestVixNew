import React, { useEffect, useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getUserStatistics, getHourlyStatistics } from '../../api/request_testlar';
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

export default function Statistik() {
  const location = useLocation();
  const navigate = useNavigate();
  const [statistics, setStatistics] = useState([]);
  const [hourlyStats, setHourlyStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterTestId, setFilterTestId] = useState(null);
  const { user, logout } = useContext(AuthContext);

  useEffect(() => {
    if (location.state?.test_id) {
      setFilterTestId(location.state.test_id);
    }
  }, [location.state]);

  useEffect(() => {
    if (filterTestId !== null) {
      fetchStatistics();
      fetchHourlyStatistics();
    }
  }, [selectedDate, filterTestId]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const res = await getUserStatistics(100, filterTestId);
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

  const fetchHourlyStatistics = async () => {
    try {
      const res = await getHourlyStatistics(selectedDate);
      if (res.user === false) {
        logout();
        window.location.href = '/';
        return;
      }
      setHourlyStats(res);
    } catch (error) {
      console.error('Hourly stats error:', error);
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
    return date.toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const downloadTXT = () => {
    let content = 'Test Natijalari Statistikasi\n';
    content += '='.repeat(50) + '\n\n';
    content += `Foydalanuvchi: ${user?.username || 'Noma\'lum'}\n`;
    content += `Nickname: ${user?.nickname || 'Noma\'lum'}\n`;
    content += `Sana: ${new Date().toLocaleDateString('uz-UZ')}\n\n`;
    content += '-'.repeat(50) + '\n\n';

    statistics.forEach((stat, index) => {
      content += `${index + 1}. Test: ${stat.test_name}\n`;
      content += `   Fan: ${stat.test_fan}\n`;
      content += `   Test ID: ${stat.test_id}\n`;
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
    link.download = `statistics_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadExcel = () => {
    const data = statistics.map((stat, index) => ({
      '#': index + 1,
      'Username': user?.username || 'Noma\'lum',
      'Nickname': user?.nickname || 'Noma\'lum',
      'Test nomi': stat.test_name,
      'Fan': stat.test_fan,
      'Test ID': stat.test_id,
      'Jami savollar': stat.total_questions,
      "To'g'ri javoblar": stat.correct_answers,
      'Xato javoblar': stat.wrong_answers,
      'Sarflangan vaqt (soniya)': stat.time_spent,
      'Sana': formatDate(stat.created)
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Statistika');
    XLSX.writeFile(wb, `statistics_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const downloadWord = async () => {
    const tableRows = [
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph('#')] }),
          new TableCell({ children: [new Paragraph('Username')] }),
          new TableCell({ children: [new Paragraph('Nickname')] }),
          new TableCell({ children: [new Paragraph('Test nomi')] }),
          new TableCell({ children: [new Paragraph('Fan')] }),
          new TableCell({ children: [new Paragraph('Test ID')] }),
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
            new TableCell({ children: [new Paragraph(user?.username || 'Noma\'lum')] }),
            new TableCell({ children: [new Paragraph(user?.nickname || 'Noma\'lum')] }),
            new TableCell({ children: [new Paragraph(stat.test_name)] }),
            new TableCell({ children: [new Paragraph(stat.test_fan)] }),
            new TableCell({ children: [new Paragraph(String(stat.test_id))] }),
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
              text: 'Test Natijalari Statistikasi',
              heading: 'Heading1',
            }),
            new Paragraph(`Foydalanuvchi: ${user?.username || 'Noma\'lum'}`),
            new Paragraph(`Nickname: ${user?.nickname || 'Noma\'lum'}`),
            new Paragraph(`Sana: ${new Date().toLocaleDateString('uz-UZ')}`),
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
    link.download = `statistics_${new Date().toISOString().split('T')[0]}.docx`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const chartData = Object.entries(hourlyStats).map(([hour, data]) => ({
    hour: `${hour}:00`,
    count: data.count,
    correct: data.total_correct,
    wrong: data.total_wrong,
    avgTime: Math.round(data.avg_time)
  }));

  return (
    <>
      <Message
        type={messageType}
        message={message}
        onClose={handleCloseMessage}
        duration={3000}
      />
      <div className='statistik_page'>
        <div className='statistics_header'>
          <Title title="Mening test statistikam"></Title>
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
          <div className='hourly_section'>
            <div className='section_header'>
              <h3>Soatlik statistika</h3>
              <input
                type='date'
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className='date_picker'
              />
            </div>
            <div className='chart_container'>
              <ResponsiveContainer width='100%' height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='hour' />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type='monotone' dataKey='count' stroke='#8884d8' name='Testlar soni' />
                  <Line type='monotone' dataKey='correct' stroke='#82ca9d' name="To'g'ri javoblar" />
                  <Line type='monotone' dataKey='wrong' stroke='#ff6b6b' name="Xato javoblar" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className='chart_container'>
              <ResponsiveContainer width='100%' height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='hour' />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey='avgTime' fill='#ffc658' name="O'rtacha vaqt (soniya)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className='table_section'>
            <h3>Top 100 natija</h3>
            {loading ? (
              <div className='loading'>Yuklanmoqda...</div>
            ) : statistics.length === 0 ? (
              <div className='empty_state'>
                <i className='bi bi-bar-chart'></i>
                <p>Hali natijalar yo'q</p>
              </div>
            ) : (
              <div className='table_container'>
                <table className='statistics_table'>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Username</th>
                      <th>Nickname</th>
                      <th>Test nomi</th>
                      <th>Fan</th>
                      <th>Test ID</th>
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
                        <td>{user?.username || 'Noma\'lum'}</td>
                        <td>{user?.nickname || 'Noma\'lum'}</td>
                        <td>{stat.test_name}</td>
                        <td>{stat.test_fan}</td>
                        <td>{stat.test_id}</td>
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
