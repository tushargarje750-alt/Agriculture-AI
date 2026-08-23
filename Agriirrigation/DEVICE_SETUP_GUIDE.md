# Device Setup Page - QR Scanning & Manual Entry Implementation Guide

## Overview
The device setup page should allow farmers to easily add IoT sensors to their farm using two methods:
1. **QR Code Scanning** (recommended for mobile devices)
2. **Manual Entry** (backup method for desktop or if QR fails)

---

## Technologies & Libraries for QR Scanning

### Option 1: **html5-qrcode** (Recommended)
**Best for:** Web-based QR scanning with excellent browser compatibility

#### Installation:
```bash
npm install html5-qrcode
```

#### Features:
- ✅ Works on both desktop (webcam) and mobile (camera)
- ✅ No native dependencies
- ✅ Supports multiple camera selection
- ✅ Auto-focus and torch/flash control
- ✅ Can scan from image files
- ✅ TypeScript support

#### Sample Implementation:
```tsx
import { Html5Qrcode } from 'html5-qrcode';
import { useEffect, useRef, useState } from 'react';

function QRScanner({ onScan }: { onScan: (deviceId: string) => void }) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [scanning, setScanning] = useState(false);

  const startScanning = async () => {
    const scanner = new Html5Qrcode("qr-reader");
    scannerRef.current = scanner;

    try {
      await scanner.start(
        { facingMode: "environment" }, // Use back camera on mobile
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        (decodedText) => {
          // Successfully scanned
          onScan(decodedText);
          stopScanning();
        },
        (errorMessage) => {
          // Scan error (can ignore)
        }
      );
      setScanning(true);
    } catch (err) {
      console.error("Camera error:", err);
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      await scannerRef.current.stop();
      scannerRef.current = null;
      setScanning(false);
    }
  };

  return (
    <div>
      <div id="qr-reader" className="w-full max-w-md mx-auto rounded-xl overflow-hidden"></div>
      <button onClick={scanning ? stopScanning : startScanning}>
        {scanning ? "Stop Scanning" : "Start Scanning"}
      </button>
    </div>
  );
}
```

**Pros:**
- Most reliable for web apps
- Great documentation
- Active maintenance
- Works on iOS Safari (important!)

**Cons:**
- Slightly larger bundle size (~100KB)

---

### Option 2: **react-qr-scanner**
**Best for:** Simple React integration with hooks

#### Installation:
```bash
npm install react-qr-scanner
```

#### Sample Implementation:
```tsx
import QrScanner from 'react-qr-scanner';

function QRScanner({ onScan }: { onScan: (data: string) => void }) {
  const handleScan = (data: any) => {
    if (data) {
      onScan(data.text);
    }
  };

  return (
    <QrScanner
      delay={300}
      onError={(err) => console.error(err)}
      onScan={handleScan}
      style={{ width: '100%' }}
    />
  );
}
```

**Pros:**
- Very simple API
- Lightweight

**Cons:**
- Less active maintenance
- Fewer features than html5-qrcode

---

### Option 3: **react-qr-reader**
**Best for:** Modern React applications with TypeScript

#### Installation:
```bash
npm install react-qr-reader
```

#### Sample Implementation:
```tsx
import { QrReader } from 'react-qr-reader';

function QRScanner({ onScan }: { onScan: (deviceId: string) => void }) {
  return (
    <QrReader
      onResult={(result, error) => {
        if (result) {
          onScan(result.getText());
        }
      }}
      constraints={{ facingMode: 'environment' }}
      className="w-full"
    />
  );
}
```

---

## Complete Device Setup Page Implementation

### Recommended Approach: **html5-qrcode**

Here's a complete implementation:

```tsx
import { useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { QrCode, Keyboard, Camera, CheckCircle, Wifi } from 'lucide-react';

export function DeviceSetupPage() {
  const [method, setMethod] = useState<'qr' | 'manual'>('qr');
  const [deviceId, setDeviceId] = useState('');
  const [scanning, setScanning] = useState(false);
  const [devices, setDevices] = useState<any[]>([]);

  const startQRScanning = async () => {
    const scanner = new Html5Qrcode("qr-reader");
    
    try {
      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        async (decodedText) => {
          // QR scanned successfully
          await handleDeviceFound(decodedText);
          scanner.stop();
          setScanning(false);
        },
        (errorMessage) => {
          // Scanning in progress (can ignore)
        }
      );
      setScanning(true);
    } catch (err) {
      alert("Camera access denied or not available");
    }
  };

  const handleDeviceFound = async (deviceCode: string) => {
    // Extract device info from QR code
    // Format: "AGRI-SENSOR-12345-MOISTURE"
    const parts = deviceCode.split('-');
    
    if (parts[0] === 'AGRI' && parts[1] === 'SENSOR') {
      const newDevice = {
        id: parts[2],
        type: parts[3],
        name: `${parts[3]} Sensor #${parts[2]}`,
        status: 'pending',
        addedAt: new Date()
      };

      // Add to devices list
      setDevices(prev => [...prev, newDevice]);

      // Connect to Firebase/backend
      await connectDeviceToBackend(newDevice);
    }
  };

  const connectDeviceToBackend = async (device: any) => {
    // Simulate API call to register device
    // In production, call your Firebase/API endpoint
    setTimeout(() => {
      setDevices(prev => prev.map(d => 
        d.id === device.id ? { ...d, status: 'connected' } : d
      ));
    }, 2000);
  };

  const handleManualEntry = async () => {
    if (deviceId.length >= 5) {
      await handleDeviceFound(`AGRI-SENSOR-${deviceId}-UNKNOWN`);
      setDeviceId('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Add New Device</h1>

      {/* Method Selection */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <button
          onClick={() => setMethod('qr')}
          className={`p-6 rounded-xl border-2 transition-all ${
            method === 'qr'
              ? 'border-green-500 bg-green-50'
              : 'border-gray-300 hover:border-green-400'
          }`}
        >
          <QrCode className="w-12 h-12 mx-auto mb-3 text-green-600" />
          <p className="font-semibold">Scan QR Code</p>
          <p className="text-sm text-gray-600 mt-1">Fastest method</p>
        </button>

        <button
          onClick={() => setMethod('manual')}
          className={`p-6 rounded-xl border-2 transition-all ${
            method === 'manual'
              ? 'border-green-500 bg-green-50'
              : 'border-gray-300 hover:border-green-400'
          }`}
        >
          <Keyboard className="w-12 h-12 mx-auto mb-3 text-green-600" />
          <p className="font-semibold">Manual Entry</p>
          <p className="text-sm text-gray-600 mt-1">Enter device ID</p>
        </button>
      </div>

      {/* QR Scanner */}
      {method === 'qr' && (
        <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">Scan Device QR Code</h2>
          
          <div id="qr-reader" className="max-w-md mx-auto rounded-xl overflow-hidden mb-4"></div>
          
          <div className="text-center">
            <button
              onClick={scanning ? () => {} : startQRScanning}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Camera className="w-5 h-5 inline mr-2" />
              {scanning ? "Scanning..." : "Start Camera"}
            </button>
            <p className="text-sm text-gray-600 mt-3">
              Point your camera at the QR code on the sensor
            </p>
          </div>
        </div>
      )}

      {/* Manual Entry */}
      {method === 'manual' && (
        <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">Enter Device ID</h2>
          <div className="flex gap-3">
            <input
              type="text"
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
              placeholder="Enter device ID (e.g., 12345)"
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg"
            />
            <button
              onClick={handleManualEntry}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Add Device
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-3">
            Find the device ID on the sensor label
          </p>
        </div>
      )}

      {/* Connected Devices */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-4">
          Connected Devices ({devices.length})
        </h2>
        
        {devices.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No devices added yet. Scan a QR code to get started.
          </p>
        ) : (
          <div className="space-y-3">
            {devices.map(device => (
              <div key={device.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {device.status === 'connected' ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <Wifi className="w-5 h-5 text-gray-400 animate-pulse" />
                  )}
                  <div>
                    <p className="font-medium">{device.name}</p>
                    <p className="text-sm text-gray-500">ID: {device.id}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  device.status === 'connected'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {device.status === 'connected' ? 'Connected' : 'Connecting...'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## QR Code Format for IoT Sensors

### Recommended Format:
```
AGRI-SENSOR-[DEVICE_ID]-[SENSOR_TYPE]
```

### Example QR Codes:
```
AGRI-SENSOR-12345-MOISTURE
AGRI-SENSOR-67890-TEMPERATURE
AGRI-SENSOR-11223-FLOW
```

### Generating QR Codes:
You can generate QR codes using:
- **Online:** qr-code-generator.com
- **Library:** `qrcode` npm package
- **Hardware:** Print QR stickers for each sensor

```bash
npm install qrcode
```

```javascript
const QRCode = require('qrcode');

QRCode.toFile('sensor-12345.png', 'AGRI-SENSOR-12345-MOISTURE', {
  width: 300,
  margin: 2
});
```

---

## Mobile vs Desktop Considerations

### Mobile (Recommended):
- Use back camera by default: `facingMode: "environment"`
- Enable torch/flash if available
- Provide image upload as fallback
- Better UX with larger touch targets

### Desktop:
- Allow webcam scanning
- Provide manual entry prominently
- Consider file upload for QR images
- Show clear instructions

---

## Security Best Practices

1. **Validate Device IDs:** Check format before accepting
2. **Authenticate Devices:** Verify with backend before connecting
3. **Unique IDs:** Each sensor must have unique identifier
4. **Encryption:** Use HTTPS for all device registration APIs
5. **Token-based Auth:** Include user token when registering devices

---

## Error Handling

```tsx
const handleScanError = (error: string) => {
  if (error.includes("NotAllowedError")) {
    alert("Camera permission denied. Please enable camera access.");
  } else if (error.includes("NotFoundError")) {
    alert("No camera found. Please use manual entry.");
  } else if (error.includes("NotReadableError")) {
    alert("Camera is being used by another application.");
  }
};
```

---

## Recommendation Summary

**Best Choice:** Use **html5-qrcode** library

**Why?**
- ✅ Works on all modern browsers (including iOS Safari)
- ✅ Most reliable QR scanning
- ✅ Active development and support
- ✅ Supports both camera and file upload
- ✅ Good TypeScript support
- ✅ Small bundle size impact

**Installation:**
```bash
npm install html5-qrcode
```

**Alternative Fallback:**
Always provide manual entry as backup for:
- Camera permission denied
- No camera available (desktop)
- QR code damaged or unreadable
- Users who prefer typing

This ensures 100% of users can add devices regardless of their hardware or permissions!
