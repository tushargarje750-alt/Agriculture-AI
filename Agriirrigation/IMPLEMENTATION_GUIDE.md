# Agri-Irrigation Platform - Implementation Guide

## 3. Interactive Farm Map Implementation

### What the Farm Map Should Do:
The interactive farm map should provide a visual representation of your farm with the following features:

1. **Display Farm Boundaries**
   - Show the actual farm layout and field divisions
   - Different zones for different crops
   - Clickable zones to view zone-specific data

2. **IoT Sensor Locations**
   - Pin markers showing exact locations of:
     - Soil moisture sensors
     - Temperature sensors
     - Humidity sensors
     - Irrigation valves
   - Color-coded markers based on sensor status (active/inactive/alert)
   - Click on markers to view real-time sensor data

3. **Real-Time Data Overlay**
   - Heat map showing moisture levels across the farm
   - Color gradients indicating irrigation needs
   - Weather overlay (rain, wind direction)

4. **Zone Management**
   - Draw and edit irrigation zones
   - Set different irrigation schedules per zone
   - View water distribution patterns

### Recommended Map APIs:

#### Option 1: **Google Maps API** (Recommended for Production)
- **Pros:**
  - High-quality satellite imagery
  - Excellent documentation
  - Drawing tools for custom zones
  - Marker clustering
  - Good performance
- **Cons:**
  - Paid (requires billing account, but has free tier)
- **Use:**
  ```javascript
  // Install: npm install @googlemaps/react-wrapper
  import { GoogleMap, Marker, Polygon, HeatmapLayer } from '@react-google-maps/api';
  ```

#### Option 2: **Mapbox GL** (Best for Customization)
- **Pros:**
  - Beautiful custom styling
  - Excellent 3D terrain visualization
  - Great for agricultural data visualization
  - Generous free tier (50,000 loads/month)
- **Cons:**
  - Slightly steeper learning curve
- **Use:**
  ```javascript
  // Install: npm install react-map-gl mapbox-gl
  import Map, { Marker, Source, Layer } from 'react-map-gl';
  ```

#### Option 3: **Leaflet** (Best for Free/Open Source)
- **Pros:**
  - Completely free
  - Lightweight
  - Large plugin ecosystem
  - Good for basic mapping needs
- **Cons:**
  - Less polished than Google Maps
  - May need multiple plugins for advanced features
- **Use:**
  ```javascript
  // Install: npm install react-leaflet leaflet
  import { MapContainer, TileLayer, Marker, Polygon } from 'react-leaflet';
  ```

### Recommended Implementation:
**Use Mapbox GL** for the best balance of features, cost, and agricultural visualization capabilities.

Example implementation:
```javascript
import Map, { Marker, Source, Layer } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Farm boundary coordinates
const farmBoundary = {
  type: 'Feature',
  geometry: {
    type: 'Polygon',
    coordinates: [[
      [-122.48, 37.83],
      [-122.48, 37.80],
      [-122.43, 37.80],
      [-122.43, 37.83],
      [-122.48, 37.83]
    ]]
  }
};

// IoT sensors from Firebase
const sensors = [
  { id: 1, lat: 37.82, lng: -122.47, type: 'moisture', value: 43, status: 'active' },
  { id: 2, lat: 37.81, lng: -122.45, type: 'temperature', value: 28, status: 'active' }
];

function FarmMap() {
  return (
    <Map
      initialViewState={{
        longitude: -122.45,
        latitude: 37.82,
        zoom: 14
      }}
      style={{ width: '100%', height: '600px' }}
      mapStyle="mapbox://styles/mapbox/satellite-v9"
      mapboxAccessToken="YOUR_MAPBOX_TOKEN"
    >
      {/* Farm Boundary */}
      <Source id="farm" type="geojson" data={farmBoundary}>
        <Layer
          id="farm-boundary"
          type="fill"
          paint={{
            'fill-color': '#10B981',
            'fill-opacity': 0.2
          }}
        />
      </Source>

      {/* IoT Sensor Markers */}
      {sensors.map(sensor => (
        <Marker
          key={sensor.id}
          longitude={sensor.lng}
          latitude={sensor.lat}
          color={sensor.status === 'active' ? '#10B981' : '#EF4444'}
          onClick={() => showSensorData(sensor)}
        />
      ))}
    </Map>
  );
}
```

---

## 4. Database Architecture for Farmer & Farm Data

### Current Setup:
- **Firebase Realtime Database** - For real-time sensor data (IoT devices)

### Recommended Complete Architecture:

#### Option A: **Firebase Suite** (Easiest Integration)
Since you're already using Firebase Realtime Database for sensors:

**Firebase Realtime Database** - For real-time sensor data only
```json
{
  "sensors": {
    "sensor_001": {
      "farmId": "farm_123",
      "type": "soil_moisture",
      "value": 43,
      "timestamp": 1710598800000,
      "location": { "lat": 37.82, "lng": -122.47 }
    }
  }
}
```

**Cloud Firestore** - For farmer and farm data (structured data)
```javascript
// Firestore Collections Structure:

// Collection: farmers
{
  farmerId: "farmer_123",
  firstName: "John",
  lastName: "Farmer",
  email: "john@farm.com",
  phone: "+1234567890",
  location: "Springfield Valley, USA",
  createdAt: timestamp,
  profilePicture: "url"
}

// Collection: farms
{
  farmId: "farm_123",
  farmerId: "farmer_123",
  name: "Green Valley Farm",
  size: 25, // acres
  address: "123 Farm Road, Springfield",
  coordinates: { lat: 37.82, lng: -122.47 },
  primaryCrop: "corn-wheat",
  irrigationType: "drip",
  soilType: "loam",
  settings: {
    autoIrrigation: true,
    moistureThreshold: 40,
    notificationsEnabled: true
  },
  zones: [
    {
      zoneId: "zone_A",
      name: "North Field",
      area: 10, // acres
      cropType: "corn",
      irrigationSchedule: "daily"
    }
  ]
}

// Collection: devices
{
  deviceId: "sensor_001",
  farmId: "farm_123",
  type: "soil_moisture",
  location: { lat: 37.82, lng: -122.47 },
  status: "active",
  batteryLevel: 87,
  lastSync: timestamp
}

// Collection: irrigation_logs
{
  logId: "log_001",
  farmId: "farm_123",
  zoneId: "zone_A",
  startTime: timestamp,
  endTime: timestamp,
  waterUsed: 120, // liters
  triggerType: "manual" | "auto" | "scheduled"
}
```

**Why this combo?**
- **Realtime Database**: Perfect for high-frequency sensor updates (every few seconds)
- **Firestore**: Better for structured data with complex queries, relationships, and less frequent updates

#### Option B: **Supabase** (PostgreSQL-based, Open Source)
If you want a more traditional relational database:

**Supabase PostgreSQL Tables:**
```sql
-- Farmers table
CREATE TABLE farmers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20),
  location VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  profile_picture TEXT
);

-- Farms table
CREATE TABLE farms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farmer_id UUID REFERENCES farmers(id),
  name VARCHAR(255),
  size DECIMAL(10,2),
  address TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  primary_crop VARCHAR(100),
  irrigation_type VARCHAR(50),
  soil_type VARCHAR(50),
  auto_irrigation BOOLEAN DEFAULT false,
  moisture_threshold INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Devices table
CREATE TABLE devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id UUID REFERENCES farms(id),
  device_type VARCHAR(50),
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  status VARCHAR(20),
  battery_level INTEGER,
  last_sync TIMESTAMP
);

-- Sensor readings (time-series data)
CREATE TABLE sensor_readings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id UUID REFERENCES devices(id),
  reading_type VARCHAR(50),
  value DECIMAL(10,2),
  timestamp TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_readings_timestamp ON sensor_readings(timestamp DESC);

-- Irrigation logs
CREATE TABLE irrigation_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id UUID REFERENCES farms(id),
  zone_id UUID,
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  water_used DECIMAL(10,2),
  trigger_type VARCHAR(20)
);
```

**Use Supabase if:**
- You need complex relational queries
- You want real-time subscriptions (similar to Firebase)
- You prefer SQL over NoSQL
- You want built-in authentication and row-level security

### Recommended Hybrid Approach:

**Best Practice for Your Use Case:**

1. **Firebase Realtime Database** → IoT sensor data (high-frequency updates)
   - Soil moisture readings
   - Temperature readings
   - Water flow rates
   - Real-time device status

2. **Cloud Firestore** → All other application data (low-frequency updates)
   - Farmer profiles
   - Farm information
   - Device registry
   - Settings
   - Irrigation schedules
   - Historical logs

**Implementation Example:**

```javascript
// firebase-config.js
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-app.firebaseapp.com",
  databaseURL: "https://your-app.firebaseio.com",
  projectId: "your-project",
  storageBucket: "your-app.appspot.com"
};

const app = initializeApp(firebaseConfig);

// Realtime Database for sensors
export const realtimeDB = getDatabase(app);

// Firestore for structured data
export const firestoreDB = getFirestore(app);
```

```javascript
// Reading sensor data (Realtime Database)
import { ref, onValue } from 'firebase/database';
import { realtimeDB } from './firebase-config';

const sensorRef = ref(realtimeDB, 'sensors/sensor_001');
onValue(sensorRef, (snapshot) => {
  const data = snapshot.val();
  console.log('Current moisture:', data.value);
});
```

```javascript
// Reading farmer data (Firestore)
import { doc, getDoc } from 'firebase/firestore';
import { firestoreDB } from './firebase-config';

const farmerDoc = await getDoc(doc(firestoreDB, 'farmers', 'farmer_123'));
console.log('Farmer data:', farmerDoc.data());
```

### Data Flow Summary:

```
IoT Sensors → Firebase Realtime DB → Real-time Dashboard Updates
     ↓
  Aggregation (every hour/day)
     ↓
  Firestore → Historical Analytics & Reports

User Actions → Firestore → Application State
     ↓
  Irrigation Commands
     ↓
  Firebase Realtime DB → IoT Devices
```

This architecture gives you:
- ✅ Real-time sensor updates (< 1 second latency)
- ✅ Efficient storage for farmer/farm data
- ✅ Easy querying and relationships
- ✅ Scalable for thousands of sensors
- ✅ Cost-effective (pay for what you use)
