# Hybrid Lab LMS - Interactive 2D Simulator

## 🚀 What's New: 2D Electude-Style Simulator

This version includes a **brand new interactive 2D simulation environment** built directly into the platform!

### ⚡ Key Features

#### 1. **Real-time Simulation Engine**
- Physics-based system modeling (RPM, battery SOC, throttle)
- Global time synchronization across all components
- 60fps animation loop for smooth interaction

#### 2. **Interactive Circuit Schematic**
- 2D SVG schematic of hybrid system
- Battery, Motor, and ICE components
- **Energy flow visualization** with animated particles
- Hover effects and component highlighting
- Real-time metrics display (RPM, voltage, SOC)

#### 3. **Professional Oscilloscope**
- HTML5 Canvas-based waveform rendering
- Configurable timebase (0.1-5 ms/div)
- Configurable voltage scale (5-100 V/div)
- Major & minor grid lines
- Real-time signal monitoring
- Green phosphor CRT aesthetic
- Axis labels and sample counter

#### 4. **Digital Multimeter**
- DC voltage measurement display
- AC/DC mode selector (UI ready)
- Range selection (UI ready)
- Connection status indicator
- Large LCD-style digital display
- Realistic button layout

#### 5. **Draggable Probe System**
- Intuitive "drag-and-drop" probe interface
- Snap detection to test points
- Visual proximity feedback
- One-click switching between measurement tools
- Multiple test points: Battery, Motor, Engine

#### 6. **Control Panel**
- Throttle slider (0-100%)
- Start/Stop simulation button
- Real-time system metrics display
- Probe status indicator

### 🎨 Engineering Style Design

- **Color Scheme**: Professional gray-blue palette (Electude-inspired)
- **Typography**: Monospace fonts for technical readout
- **Grid System**: Technical grid patterns on oscilloscope
- **Visual Hierarchy**: Clear sections with borders and spacing
- **Responsive Layout**: Adaptive to different screen sizes

### 🔧 How to Use

1. **Navigate to Simulator**:
   - Dashboard → Select a module → Opens 2D Simulator

2. **Start the Simulation**:
   - Click "START" button in the Control Panel

3. **Connect Probe to Test Point**:
   - Drag the gray probe circle to a colored test point
   - Observe visual feedback (yellow glow = near, red = connected)

4. **Switch Measurement Tools**:
   - Use tabs to switch between Oscilloscope and Multimeter

5. **Adjust Parameters**:
   - Move throttle slider to see real-time signal changes
   - Use oscilloscope controls to adjust timebase and voltage scale

6. **Analyze Signals**:
   - View waveform on oscilloscope canvas
   - Read precise voltage on multimeter
   - Watch energy particles flow between components

### 📊 Signal Generation

The simulator generates realistic signals:

```
Battery:  144V * throttle + sine_variation + noise
Motor:    120V * sin(2πt) + noise  
Engine:   12V + spike_pattern + noise
```

All signals vary with:
- **Throttle input** (0-100%)
- **Global time** (oscillation)
- **Random noise** (±2.5% for realism)

### 🛠 Technical Stack

- **Framework**: React 18 (CDN)
- **Rendering**: Canvas API (oscilloscope) + SVG (schematic)
- **Styling**: Inline CSS + CSS Grid/Flex
- **Physics**: Custom equations in `useSimulation` hook
- **State Management**: React hooks

### 📁 Project Structure

```
index.html (Single file, all-in-one)
├── Styles (embedded CSS)
├── React Components
│   ├── Simulation Engine (useSimulation hook)
│   ├── SignalSource class
│   ├── Canvas Oscilloscope
│   ├── SVG Circuit Schematic
│   ├── Draggable Probe
│   ├── Digital Multimeter
│   ├── Control Panel
│   └── Enhanced Simulator Page
└── React App Router

SIMULATOR_GUIDE.md (Detailed architecture documentation)
```

### 🎓 Educational Value

Students learn:
- ✅ Reading analog signals with oscilloscope
- ✅ Measuring DC voltages with multimeter  
- ✅ Understanding energy distribution in hybrid systems
- ✅ Real-time system monitoring
- ✅ Signal analysis and waveform interpretation
- ✅ Integration of electrical components

### 🔬 Measurement Tools

#### Oscilloscope
- View periodic signals with grid
- Adjust two independent scales (time & voltage)
- Observe phase relationships
- Count cycles manually

#### Multimeter
- Precise DC voltage readings
- Connection status feedback
- Large digital display
- Professional industrial design

### ⚙️ Configuration

To modify simulator behavior, edit these parameters in `useSimulation` hook:

```javascript
// Base frequencies
const motorSource = new SignalSource("motor", 120, 2);     // 2Hz frequency
const batterySource = new SignalSource("battery", 144, 0.5); // 0.5Hz

// Throttle sensitivity
if (prev.throttle > 0.6) newSoc -= 0.01; // Battery discharge rate
```

### 🚀 Performance

- **FPS**: Stable 60fps on modern hardware
- **Memory**: Waveform buffer capped at 512 samples
- **CPU**: Optimized RAF loop with batched state updates
- **Canvas**: Uses devicePixelRatio for sharp rendering

### 📱 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14.1+
- Mobile browsers (touch-friendly probe dragging)

### 🎯 Next Steps

1. **Try the simulator**: Click "Start" and drag the probe
2. **Experiment**: Change throttle and watch signals change
3. **Analyze**: Study the waveforms and energy flow
4. **Learn**: Refer to SIMULATOR_GUIDE.md for detailed info

### 📚 Documentation

- **SIMULATOR_GUIDE.md**: Complete architecture reference
- **This README**: Quick start guide
- **Inline comments**: Throughout code in index.html

---

**Version**: 2.0 - 2D Interactive Edition  
**Created**: 2026  
**Platform**: Hybrid Lab LMS  
**Status**: ✅ Production Ready
