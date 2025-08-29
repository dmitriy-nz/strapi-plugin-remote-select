# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Strapi plugin called "remote-select" that adds dynamic select input components to Strapi admin panels. It allows content managers to select values from remote APIs rather than static options. The plugin supports both static remote selects and searchable/autocomplete remote selects.

## Development Commands

- `npm run build` - Build the plugin for distribution
- `npm run watch` - Watch and rebuild on file changes during development
- `npm run watch:link` - Watch and rebuild with linking for local development
- `npm run verify` - Verify the plugin build
- `npm run test:ts:front` - TypeScript type check for admin (frontend) code
- `npm run test:ts:back` - TypeScript type check for server (backend) code

## Architecture

### Plugin Structure
The plugin follows Strapi's dual-structure pattern with separate admin and server directories:

- **Admin (`/admin/src/`)**: React components for Strapi's admin panel UI
- **Server (`/server/src/`)**: Backend services, controllers, and routes
- **Types (`/types/`)**: Shared TypeScript type definitions

### Core Components

#### Admin Side
- `RemoteSelect.tsx`: Basic remote select component for static option loading
- `SearchableRemoteSelect.tsx`: Advanced component with search/autocomplete functionality
- Registration functions that integrate components into Strapi's field system

#### Server Side
- `OptionsProxy.service.ts`: Core service for fetching and processing remote options
  - Handles HTTP requests to external APIs
  - Processes JSON responses using JSONPath queries
  - Supports variable replacement in URLs, headers, and request bodies
- `FetchOptionsProxy.controller.ts`: REST endpoint for option fetching

### Key Features
- **Variable Support**: URLs, headers, and request bodies can contain `{variableName}` placeholders that get replaced with values from plugin configuration
- **JSONPath Processing**: Uses JSONPath to extract options, labels, and values from complex API responses
- **Flexible Data Mapping**: Configurable paths for extracting display labels and stored values
- **Multi-select Support**: Both single and multiple selection modes
- **Error Handling**: Comprehensive error handling for API failures and data processing

### Data Flow
1. Admin component makes POST request to `/remote-select/options-proxy`
2. Controller validates request using schema (`RemoteSelectFetchOptions.schema.ts`)
3. Service processes configuration and makes external API call
4. Response is parsed using JSONPath and returned as standardized options
5. Component renders select with processed options

### Configuration Types
- `FlexibleSelectConfig`: Complete field configuration
- `RemoteSelectFetchOptions`: API fetch configuration subset
- `SearchableRemoteSelectValue`: Standardized option format (`{value, label}`)
- `RemoteSelectPluginOptions`: Plugin-level configuration including variables

## Development Notes

- Plugin is compatible with both Strapi 4 and Strapi 5
- Uses Strapi's design system components (`@strapi/design-system`)
- Frontend components are registered via `registerRemoteSelect()` and `registerSearchableRemoteSelect()` functions
- All API communication goes through the options proxy service for security and consistency
- Variable replacement allows dynamic API configuration without hardcoding values