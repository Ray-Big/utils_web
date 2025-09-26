import React, { useState, useEffect } from 'react';
import { format, addHours, subDays, addDays, startOfHour, startOfDay, isEqual, endOfDay } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import './TimeZonePage.css';

const timeZoneOptions = [
    "UTC",
    "America/New_York",
    "Europe/London",
    "Europe/Moscow",
    "Asia/Shanghai",
    "Asia/Tokyo",
    "Australia/Sydney"
];

const TimeZonePage = () => {
    const [timeZones, setTimeZones] = useState(['UTC']);
    const [selectedTimeZone, setSelectedTimeZone] = useState('');
    const [timeGrid, setTimeGrid] = useState({ hours: [], rows: [], dates: [] });
    const [dateRange, setDateRange] = useState([
        {
            startDate: subDays(new Date(), 2),
            endDate: addDays(new Date(), 1),
            key: 'selection'
        }
    ]);

    useEffect(() => {
        const { startDate, endDate } = dateRange[0];
        const startTime = startOfHour(startDate);

        let effectiveEndDate = endDate;
        if (isEqual(startOfDay(startDate), startOfDay(endDate))) {
            effectiveEndDate = endOfDay(startDate);
        }

        const endTime = effectiveEndDate;
        const hours = [];
        let currentTime = startTime;

        while (currentTime <= endTime) {
            hours.push(currentTime);
            currentTime = addHours(currentTime, 1);
        }

        const dates = hours.reduce((acc, hour) => {
            const day = startOfDay(hour);
            const dayStr = format(day, 'yyyy-MM-dd');
            if (!acc.find(d => d.date === dayStr)) {
                acc.push({ date: dayStr, colspan: 1 });
            } else {
                acc[acc.length - 1].colspan++;
            }
            return acc;
        }, []);

        const rows = timeZones.map(tz => {
            return {
                tz,
                times: hours.map(hour => {
                    const zonedTime = toZonedTime(hour, tz);
                    return format(zonedTime, 'HH:00', { timeZone: tz });
                })
            };
        });

        setTimeGrid({ hours, rows, dates });
    }, [timeZones, dateRange]);

    const handleAddTimeZone = () => {
        if (selectedTimeZone && !timeZones.includes(selectedTimeZone)) {
            setTimeZones([...timeZones, selectedTimeZone]);
        }
    };

    return (
        <div className="time-zone-page">
            <h1>Time Zone Visualizer</h1>
            <div className="controls-container">
                <div className="time-zone-input">
                    <select
                        value={selectedTimeZone}
                        onChange={(e) => setSelectedTimeZone(e.target.value)}
                    >
                        <option value="" disabled>Select a time zone</option>
                        {timeZoneOptions.map(tz => (
                            <option key={tz} value={tz}>{tz}</option>
                        ))}
                    </select>
                    <button onClick={handleAddTimeZone}>Add Time Zone</button>
                </div>
                <div className="date-range-picker">
                    <DateRangePicker
                        onChange={item => setDateRange([item.selection])}
                        ranges={dateRange}
                    />
                </div>
            </div>
            <div className="time-grid-container">
                <table>
                    <thead>
                        <tr>
                            <th className="time-zone-header" rowSpan="2">Time Zone</th>
                            {timeGrid.dates.map(d => (
                                <th key={d.date} colSpan={d.colspan} className="date-header">{d.date}</th>
                            ))}
                        </tr>
                        <tr>
                            {timeGrid.hours.map((hour, index) => (
                                <th key={index} className="hour-header">{format(hour, 'HH:00')}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {timeGrid.rows.map(row => (
                            <tr key={row.tz}>
                                <td className="time-zone-cell">{row.tz}</td>
                                {row.times.map((time, index) => (
                                    <td key={index}>{time}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TimeZonePage;