import React, { useRef, useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, Cell } from 'recharts';
import html2canvas from 'html2canvas';
import { PDFViewer, Document, Page, View, Text, Image } from '@react-pdf/renderer';

const LineChartComponent = ({ emissions }) => {
  const chartRef = useRef(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');

  const [pdfImage, setPdfImage] = useState('');
  const [pdfStats, setPdfStats] = useState([]);

  const calculateSummaryStats = () => {
    const stats = emissions.reduce((acc, emission) => {
      const existingStatIndex = acc.findIndex((stat) => stat.pollutant === emission.pollutant);
      if (existingStatIndex !== -1) {
        // Update existing stat
        acc[existingStatIndex].total += emission.value;
        acc[existingStatIndex].count += 1;
      } else {
        // Add new stat
        acc.push({
          pollutant: emission.pollutant,
          total: emission.value,
          count: 1,
        });
      }

      return acc;
    }, []);

    const formattedStats = stats.map((stat) => ({
      pollutant: stat.pollutant,
      total: stat.total.toFixed(2),
      average: (stat.total / stat.count).toFixed(2), // Calculate average
    }));

    setPdfStats(formattedStats);
  };

  useEffect(() => {
    calculateSummaryStats();
  }, [emissions]);

  const handleLogin = () => {
    // For simplicity, hardcoding the credentials. In a real-world scenario, you would perform server-side authentication.
    if (userId === 'admin' && password === 'beyos') {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  };

  const handleDownload = () => {
    if (chartRef.current) {
      html2canvas(chartRef.current).then((canvas) => {
        setPdfImage(canvas.toDataURL('image/png'));
      });
    }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      {isAuthenticated ? (
        <>
          <h2>Statistics</h2>
          <div ref={chartRef} style={{ display: 'inline-block', marginBottom: '20px' }}>
            <LineChart
              width={600}
              height={400}
              data={emissions}
              animationBegin={0}
              animationDuration={1000}
              animationEasing="ease-in-out"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <YAxis />
              <Legend />
              <Tooltip />
              {emissions.map((emission) => (
                <Line
                  key={emission._id}
                  type="monotone"
                  dataKey="value"
                  data={emissions.filter((item) => item.pollutant === emission.pollutant)}
                  name={emission.pollutant}
                  stroke={`#${Math.floor(Math.random() * 16777215).toString(16)}`}
                />
              ))}
            </LineChart>
          </div>

          <div style={{ width: '60%', marginLeft: '30vw' }}>
            <h3 style={{marginLeft: '-15vw'}}>Total Emissions</h3>
            <BarChart width={600} height={300} data={pdfStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="pollutant" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" fill="#8884d8" />
            </BarChart>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h3>Report</h3>
            {pdfStats.map((stat) => (
              <p key={stat.pollutant}>
                {stat.pollutant}: Total - {stat.total} <br />
                Average - {stat.average}
              </p>
            ))}
          </div>

          <button onClick={handleDownload}>Report</button>
        </>
      ) : (
        <div>
          <h2>Login</h2>
          <input type="text" placeholder="User ID" value={userId} onChange={(e) => setUserId(e.target.value)} />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button onClick={handleLogin}>Log In</button>
          <p>Please log in to view and download the report.</p>
        </div>
      )}

      {pdfImage && (
        <PDFViewer width="100%" height={600}>
          <PDFDocument pdfImage={pdfImage} pdfStats={pdfStats} />
        </PDFViewer>
      )}
    </div>
  );
};

const PDFDocument = ({ pdfImage, pdfStats }) => (
  <Document>
    <Page size="A4">
      <View>
        <Text>Emissions</Text>
        <View>
          <Image src={pdfImage} style={{ width: '100%', height: 'auto' }} />
        </View>
        <Text>Statistics</Text>
        {pdfStats.map((stat) => (
          <Text key={stat.pollutant}>
            {stat.pollutant}:
            Total - {stat.total},
            Average - {stat.average}
          </Text>
        ))}
        {/* <View>
          <Text>Total Emissions</Text>
          <Image src={pdfImage} style={{ width: '100%', height: 'auto' }} />
        </View> */}
      </View>
    </Page>
  </Document>
);

export default LineChartComponent;
