# Project Memory & Knowledge Base

## Project Overview
**Repository**: `gulasz101/vrr-departure-board`  
**Type**: Self-hosted VRR (Düsseldorf/NRW public transport) departure board  
**Tech Stack**: Node.js Express backend + Vanilla HTML/CSS/JS frontend + Docker deployment

## Current State (2026-01-21)

### Recent Work Completed
1. **Created AGENTS.md** - Comprehensive development guidelines for agentic coding assistants
2. **Added GitHub Actions** - Automated Docker builds on tag releases to GHCR
3. **Fixed multi-platform build** - Added `docker/setup-buildx-action` to resolve build failures
4. **Released v0.1.0** - First tagged release with automated Docker image building

### Repository Structure
```
departure-board/
├── .github/workflows/docker.yml    # GitHub Action for automated builds
├── AGENTS.md                       # Development guidelines
├── server.js                       # Express backend (CORS proxy for VRR API)
├── public/index.html               # Complete frontend (~49KB, single file)
├── package.json                    # Node.js deps (express only)
├── Dockerfile                      # Multi-stage Docker build
├── docker-compose.yml              # Local development setup
└── README.md                       # Project documentation
```

## Available Commands & Tools

### Development Commands
```bash
npm start          # Start server on port 8080
npm stop           # Kill running server process
```

### Testing Commands
```bash
# Health check
curl http://localhost:8080/health

# API testing
curl "http://localhost:8080/api/stops?q=Düsseldorf"
curl "http://localhost:8080/api/departures?stop=5000001"
```

### Docker Commands
```bash
docker-compose up -d    # Start with compose
docker-compose down     # Stop services
docker-compose logs -f  # View logs
```

### Git Commands Available
- Standard git operations work normally
- GitHub CLI (`gh`) available for:
  - `gh run list` - List recent Actions
  - `gh run view <id> --log` - View detailed logs
  - `gh release create` - Create releases

## System Tools Discovered

### File Operations
- `read` - Read files with offset/limit support
- `write` - Write/overwrite files
- `edit` - Find/replace in files (supports multiple instances)
- `glob` - File pattern matching
- `grep` - Content searching with regex

### Development Tools
- `bash` - Execute shell commands (supports workdir)
- `task` - Launch specialized agents (explore, general)
- `webfetch` - Fetch web content as markdown/text/html
- `websearch` - Exa AI web search for current information
- `codesearch` - Exa Code API for programming documentation

### Interactive Tools
- `question` - Ask user questions with options (30char limit for labels)
- `todowrite`/`todoread` - Manage task lists for complex work
- `skill` - Load specialized skill instructions

## Key Technical Patterns

### Backend (server.js)
- **Error Handling**: Comprehensive try-catch with structured error classification
- **Logging**: Custom `log(level, message, data)` helper with timestamps
- **API Integration**: URLSearchParams for VRR EFA API queries
- **Environment**: PORT (default 8080), TZ (Europe/Berlin recommended)

### Frontend (index.html)
- **Architecture**: Single HTML file containing all code
- **Storage**: localStorage for configuration persistence
- **DOM**: Vanilla JS with `getElementById`/`querySelector`
- **Async**: Fetch API with error handling
- **Compatibility**: iOS Safari optimizations, vendor prefixes

### Docker Configuration
- **Base Image**: `node:20-alpine`
- **Multi-platform**: linux/amd64, linux/arm64 support
- **Registry**: GitHub Container Registry (ghcr.io)
- **Health Check**: `/health` endpoint

## CI/CD Pipeline

### GitHub Action Workflow
- **Trigger**: Push to version tags (v*)
- **Registry**: ghcr.io/gulasz101/vrr-departure-board
- **Platforms**: linux/amd64, linux/arm64
- **Tags**: Version tags + `latest` for default branch
- **Permissions**: contents:read, packages:write

### Release Process
```bash
# 1. Make changes
git add . && git commit -m "Description"

# 2. Push changes
git push

# 3. Create release tag
git tag v0.2.0
git push origin v0.2.0

# 4. Monitor build at: https://github.com/gulasz101/vrr-departure-board/actions

# 5. Pull resulting image
docker pull ghcr.io/gulasz101/vrr-departure-board:v0.2.0
```

## Code Style Guidelines (From AGENTS.md)

### JavaScript
- **Semicolons**: Required
- **Quotes**: Single preferred, double acceptable
- **Functions**: Declarations for main functions, expressions for callbacks
- **Naming**: camelCase for variables/functions, UPPER_SNAKE_CASE for constants
- **Error Handling**: Try-catch with detailed logging

### CSS
- **Prefixes**: Include -webkit- for compatibility
- **Variables**: Use CSS custom properties for theming
- **Approach**: Mobile-first with flexbox layouts

### File Organization
- **Frontend**: Everything in single `public/index.html` file
- **Backend**: Single `server.js` file
- **Config**: Environment variables + localStorage

## Common Issues & Solutions

### Multi-platform Docker Builds
**Problem**: `Multi-platform build is not supported for docker driver`  
**Solution**: Add `docker/setup-buildx-action@v3` before build step

### Git Commit Identity
**Problem**: Automatic git config uses system user  
**Solution**: `git config --global --edit` to set proper identity

### Question Tool Limits
**Problem**: Labels must be ≤30 characters  
**Solution**: Use short, concise labels in question options

## Future Enhancement Ideas

### Potential Features
1. **Caching Layer**: Redis or memory cache for VRR API responses
2. **Rate Limiting**: Prevent API abuse
3. **Monitoring**: Prometheus metrics for API response times
4. **Multiple Cities**: Support for other transport APIs
5. **Real-time Updates**: WebSocket connections for live data

### Technical Debt
1. **Test Suite**: Add unit/integration tests
2. **Linting**: ESLint/Prettier configuration
3. **TypeScript**: Migrate from JavaScript
4. **Bundle Size**: Monitor and optimize frontend size
5. **Documentation**: API documentation with OpenAPI/Swagger

## Important Context for Future Sessions

### When Resuming Work
1. Check latest commit: `git log --oneline -5`
2. Check running services: `docker-compose ps`
3. Check recent Actions: `gh run list --limit 5`
4. Review AGENTS.md for development patterns

### Debugging Approach
1. **Backend**: Check logs at server startup and API calls
2. **Frontend**: Use browser dev tools, check localStorage config
3. **Docker**: `docker-compose logs -f` for container logs
4. **CI/CD**: `gh run view <id> --log` for build failures

### Deployment Checklist
1. **Local**: Test `npm start` and API endpoints
2. **Docker**: Verify `docker-compose up -d` works
3. **Release**: Create semantic version tag (vX.Y.Z)
4. **Monitor**: Watch GitHub Actions build completion
5. **Verify**: Pull and test resulting image

## Environment Variables Reference
- `PORT`: Server port (default: 8080)
- `TZ`: Timezone (default: system, recommended: Europe/Berlin)
- `NODE_ENV`: Environment (development/production)

## API Endpoints Reference
- `GET /health` - Health check
- `GET /api/stops?q=<query>` - Stop search (min 3 chars)
- `GET /api/departures?stop=<stopId>` - Departures for stop
- Static files served from `/public`

---

**Last Updated**: 2026-01-21  
**Version**: v0.1.0 released  
**Status**: CI/CD pipeline operational