# AGENTS.md

This file contains guidelines and commands for agentic coding assistants working on the departure-board project.

## Project Overview

This is a self-hosted VRR (Düsseldorf/NRW public transport) departure board web application with:
- **Backend**: Node.js Express server acting as CORS proxy for VRR EFA API
- **Frontend**: Single HTML file with vanilla CSS/JavaScript (no build tools)
- **Deployment**: Docker with docker-compose support
- **Features**: Drag-and-drop stop reordering (grid & settings), touch support for mobile

## Serena MCP Integration

The project uses Serena MCP for efficient code analysis and navigation.

### Initial Setup
```bash
# Activate project in Serena
serena_activate_project(project: "/Users/wojciechgula/Projects/departure-board")
```

### Useful Tools
- `serenca_get_symbols_overview()` - Get symbols (functions, constants, variables) in a file
- `serenca_find_symbol()` - Search for specific symbols with name path patterns
- `serenca_find_referencing_symbols()` - Find all references to a symbol
- `serenca_search_for_pattern()` - Search for patterns in codebase
- `serenca_list_dir()` - List directory contents

### Example Usage
```javascript
// Get overview of server.js
serenca_get_symbols_overview({ relative_path: "server.js" })

// Find all references to a function
serenca_find_referencing_symbols({ name_path: "fetchDepartures", relative_path: "public/index.html" })
```

## Build/Test Commands

### Available Commands
```bash
npm start          # Start the Node.js server (default port 8080)
npm stop           # Stop the running server process
```

### Development Workflow
```bash
# Start development server
npm start

# Test API endpoints
curl http://localhost:8080/health
curl "http://localhost:8080/api/stops?q=Düsseldorf"
curl "http://localhost:8080/api/departures?stop=5000001"
```

### Docker Commands
```bash
docker-compose up -d    # Start with docker-compose
docker-compose down     # Stop services
docker-compose logs -f  # View logs
```

## Code Style Guidelines

### JavaScript (server.js)
- **Semicolons**: Required at end of statements
- **Quotes**: Single quotes preferred, double quotes acceptable
- **Functions**: Use function declarations for main functions, expressions for callbacks
- **Error Handling**: Comprehensive try-catch blocks with detailed logging
- **Logging**: Use the `log(level, message, data)` helper function
- **Variable Naming**: camelCase for variables and functions
- **Constants**: UPPER_SNAKE_CASE for constants (PORT, URL patterns)

### JavaScript (frontend - public/index.html)
- **Structure**: All frontend code in single HTML file
- **Functions**: Function declarations for main functions, IIFE for initialization
- **DOM Manipulation**: Use `getElementById` and `querySelector`
- **Event Handling**: Add event listeners, avoid inline handlers
- **Data Storage**: Use localStorage for configuration persistence
- **Async Operations**: Fetch API with proper error handling
- **Drag & Drop**: Use `makeDraggable()` function, add polyfills for older browsers

### CSS Guidelines
- **Vendor Prefixes**: Include -webkit- prefixes for older browser compatibility (iOS 5+)
- **CSS Variables**: Use custom properties for theming (colors, spacing)
- **Responsive Design**: Mobile-first approach with flexbox layouts
- **Touch Support**: Add -webkit-touch-callout, -webkit-tap-highlight-color

### HTML Structure
- **Single Page**: All frontend code in `public/index.html`
- **Semantic HTML**: Use appropriate HTML5 elements
- **Meta Tags**: Include viewport and iOS web app meta tags
- **Progressive Enhancement**: Ensure functionality without JavaScript

## File Organization

```
departure-board/
├── server.js                   # Express backend server
├── public/
│   └── index.html              # Complete frontend (HTML/CSS/JS)
├── package.json                # Node.js dependencies
├── Dockerfile                  # Docker configuration
├── docker-compose.yml          # Docker compose setup
├── README.md                  # Project documentation
├── AGENTS.md                  # Agent guidelines
├── PROJECT_MEMORY.md          # Project knowledge base
└── .serena/                   # Serena MCP index and cache
```

## API Integration Patterns

### VRR EFA API Endpoints
- **Stop Search**: `https://efa.vrr.de/vrr/XSLT_STOPFINDER_REQUEST`
- **Departures**: `https://efa.vrr.de/vrr/XSLT_DM_REQUEST`
- **Parameters**: Use URLSearchParams for query construction
- **Response Format**: JSON with structured error handling

### Error Handling Patterns
```javascript
// Network error classification
if (err.code === 'ENOTFOUND' || err.code === 'EAI_AGAIN') {
    errorType = 'DNS_ERROR';
    userMessage = 'Cannot resolve VRR API hostname';
} else if (err.code === 'ECONNREFUSED') {
    errorType = 'CONNECTION_REFUSED';
    userMessage = 'Connection to VRR API refused';
}

// Response error structure
res.status(500).json({
    error: userMessage,
    details: {
        type: errorType,
        code: err.code,
        originalMessage: err.message
    }
});
```

## Frontend Architecture (public/index.html)

### Key Functions
- `renderStopsGrid()` - Renders main departure board
- `renderStopsConfig()` - Renders settings modal with stop configs
- `makeDraggable(el, index, source)` - Makes element draggable (grid or config)
- `reorderStops(fromIdx, toIdx, source)` - Reorders stops and persists to localStorage
- `fetchDepartures(stop, callback)` - Fetches departures for a stop
- `fetchPlatformsForStop(stopId, callback)` - Fetches available platforms

### Drag and Drop System
- Uses HTML5 drag-and-drop API for desktop
- Uses touch events for mobile/tablet (iOS 5+ compatible)
- Polyfills: `closest()` method, event listener handling
- Visual feedback: opacity changes, border highlights

### State Management
- `config` object stored in localStorage ('departures_config_v3')
- Contains: stops array, refreshInterval, maxDepartures
- Stop object structure: `{ id, name, label, platforms[], timeFrom, timeTo }`

## Testing Approach

### Manual Testing
- Test API endpoints directly with curl
- Verify frontend functionality in different browsers
- Test drag-and-drop on desktop and mobile devices
- Test Docker deployment locally

### Health Check
- Endpoint: `/health` returns `{ status: 'ok', timestamp: '...' }`
- Use for monitoring and container health checks

## Configuration Management

### Environment Variables
- `PORT`: Server port (default: 8080)
- `TZ`: Timezone (default: system, recommended: Europe/Berlin)

### Frontend Configuration
- Stored in localStorage as JSON
- Includes stop list, display preferences, refresh intervals
- Support for both old and new configuration formats
- Key: 'departures_config_v3'

## Security Considerations

- **CORS**: Backend proxy handles cross-origin requests
- **Input Validation**: Validate query parameters (minimum length, required fields)
- **Output Escaping**: Use `escapeHtml()` for user-facing content
- **Error Messages**: Sanitized error messages for end users

## Deployment Guidelines

### Docker Configuration
- Base image: `node:20-alpine`
- Working directory: `/app`
- Environment timezone: `Europe/Berlin`
- Health check: Use `/health` endpoint

### Production Considerations
- Use process manager (PM2) for Node.js applications
- Configure reverse proxy (nginx) for SSL termination
- Monitor logs and API response times
- Set up container restart policies

## Code Modification Guidelines

### When Adding Features
1. **Backend**: Add new API endpoints following existing patterns
2. **Frontend**: Add functions to the HTML file, maintain single-file structure
3. **Configuration**: Extend localStorage config format with backward compatibility
4. **Error Handling**: Follow existing error classification patterns
5. **Drag & Drop**: Use existing `makeDraggable()` and `reorderStops()` utilities
6. **Browser Support**: Add -webkit- prefixes for iOS compatibility

### When Fixing Bugs
1. **Logging**: Add appropriate log statements for debugging
2. **Error Messages**: Provide clear, actionable error messages
3. **Backward Compatibility**: Maintain support for existing configuration formats
4. **Testing**: Verify both frontend and backend functionality

## Performance Considerations

- **Caching**: No caching implemented - consider for high-traffic deployments
- **API Rate Limits**: Be mindful of VRR API usage patterns
- **Bundle Size**: Frontend is ~50KB - monitor size when adding features
- **Memory Usage**: Minimal Node.js memory footprint

## Browser Compatibility

- **Modern Browsers**: Full functionality including drag-and-drop
- **iOS Safari**: Full support (iOS 5+ with -webkit- prefixes)
- **iPad**: Tested and supported (including iPad 3)
- **Android**: Responsive design works on mobile devices
- **Legacy Browsers**: Vendor prefixes included, polyfills for older methods
