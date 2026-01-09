## HTML Decoding

The OpenTDB API returns questions with HTML entities such as `&quot;` and `&#039;`.  
To ensure proper readability, these entities are decoded before rendering in the UI.

### Approach Used
A **manual HTML decoding function** is implemented using a lookup table for commonly occurring entities.

### Why this approach?
- Avoids adding extra dependencies
- Sufficient for the limited and predictable entities returned by OpenTDB
- Keeps the project lightweight for assessment purposes

### Limitation
- Only common HTML entities are handled
- Additional entities may need to be added if required
