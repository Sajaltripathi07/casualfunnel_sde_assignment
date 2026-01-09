# HTML Decoding Options

## Why decodeHtml is needed:
The OpenTDB API returns questions like:
- `"What is 2 + 2?"` → `"What is 2 + 2?"` (with &quot;)
- `"It's easy"` → `"It&#039;s easy"` (with &#039;)

Without decoding, users see: `"What is 2 + 2?"` instead of `"What is 2 + 2?"`

## Option 1: Using a Library (SIMPLEST - Recommended)

Install the `he` library:
```bash
npm install he
```

Then replace the function with:
```javascript
const he = require('he');

function decodeHtml(html) {
  return he.decode(html);
}
```

**Pros:**
- ✅ One line of code
- ✅ Handles ALL HTML entities automatically
- ✅ Well-tested and maintained
- ✅ No bugs with edge cases

**Cons:**
- ❌ Adds one small dependency (~10KB)

## Option 2: Manual Approach (Current - No Dependencies)

The current implementation uses a lookup table for common entities.

**Pros:**
- ✅ No external dependencies
- ✅ Works for most common cases

**Cons:**
- ❌ More code to maintain
- ❌ Might miss some rare entities
- ❌ Need to add new entities manually

## Recommendation

For production, use **Option 1** (he library) - it's simpler and more reliable.

