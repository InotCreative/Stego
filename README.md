# Steganography Web Service

A web-based steganography service that allows users to hide secret messages within files using bit-level manipulation. The application provides a public gallery of modified files while keeping the hidden messages secret.

## Features

- **Client-Side Steganography**: Embed and extract messages entirely in the browser
- **Automatic Header Protection**: Prevents file corruption by automatically skipping file format headers
- **Multiple Modes**: Support for fixed and variable periodicity patterns
- **Public Gallery**: Display modified files without revealing hidden content
- **Password Protection**: Simple authentication for file submission
- **Flexible Parameters**: Configurable starting position, periodicity, and operation modes

## Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Create environment file
echo "NEXT_PUBLIC_SUBMIT_PASSWORD=your-password" > .env.local

# Run development server
npm run dev

# Open http://localhost:3000
```

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel: https://vercel.com/new
3. Add environment variable:
   - `NEXT_PUBLIC_SUBMIT_PASSWORD`: Your chosen password
4. Deploy

Vercel will automatically detect Next.js and configure the build.

## Usage

### Embedding a Message

1. Navigate to `/submit` and enter the password
2. Upload a carrier file (max 50MB) - the file that will hide the message
3. Upload a message file (max 5MB) - the secret to hide
4. Set parameters:
   - **Starting Bit (S)**: Use 0 for automatic (headers are skipped automatically)
   - **Periodicity (L)**: Bit interval for embedding (e.g., 8)
   - **Mode (C)**: FIXED, PATTERN_1, or PATTERN_2
5. Click "Embed Message" and download the modified file
6. **Save the parameters** - you'll need them to extract!

### Extracting a Message

1. Navigate to `/extract` (no password required)
2. Upload the modified file
3. Enter the exact parameters used during embedding
4. Click "Extract Message" and download

### Adding Files to Gallery

Since this is a static site, adding files to the gallery requires manual steps:

1. Add files to `/public/gallery/` directory
2. Update `/public/gallery.json`:

```json
{
  "files": [
    {
      "id": "unique-id",
      "filename": "your-file.jpg",
      "path": "/gallery/your-file.jpg",
      "type": "image/jpeg",
      "timestamp": "2026-04-18T10:00:00Z"
    }
  ]
}
```

3. Commit and push to trigger redeployment

## File Header Protection

The application automatically protects file format headers to prevent corruption:

- Automatically detects file types (JPEG, PNG, PDF, etc.)
- Skips headers when embedding (e.g., JPEG: 20 bytes, PNG: 33 bytes)
- Works transparently during both embedding and extraction
- Files remain valid and openable after steganography operations

## Technology Stack

- Next.js 14 with App Router
- React 18 with TypeScript
- Tailwind CSS
- Client-side file processing with File API

## Security Notes

- All steganography processing happens client-side
- No server-side storage of sensitive data
- Simple password protection for submission
- File size limits enforced (50MB carrier, 5MB message)

## License

This project is for educational purposes.
