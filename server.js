const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
app.use(cors());
app.use(express.json());

// Kết nối Database MySQL (dùng XAMPP)
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '', // Mặc định XAMPP để trống mật khẩu
    database: 'tms_forwarder'
});

// API Tra cứu vận đơn
app.get('/api/track/:tracking_number', async (req, res) => {
    const trackingNumber = req.params.tracking_number;

    try {
        const [shipmentRows] = await pool.query(
            'SELECT * FROM shipments WHERE id = ?', 
            [trackingNumber]
        );

        if (shipmentRows.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy thông tin vận đơn này.' });
        }

        const [eventRows] = await pool.query(
            'SELECT * FROM shipment_events WHERE shipment_id = ? ORDER BY event_date DESC', 
            [trackingNumber]
        );

        res.json({
            shipment_info: shipmentRows[0],
            tracking_history: eventRows
        });

    } catch (error) {
        res.status(500).json({ error: 'Lỗi hệ thống' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`TMS Backend đang chạy tại port ${PORT}`);
});