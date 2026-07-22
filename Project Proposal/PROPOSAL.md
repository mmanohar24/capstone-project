# Motor Archive — Project Proposal

**Springboard Software Engineering Bootcamp, Capstone Step 2**
**GitHub:** https://github.com/mmanohar24/capstone-project

---

## Project Summary

| Field | Details |
|---|---|
| Stack | React (Vite), Node.js, Express, MongoDB, Mongoose, Tailwind CSS, JWT, bcrypt, ESLint, Prettier |
| Focus | Evenly focused full-stack application |
| Type | Web application, fully responsive for desktop and mobile browsers |
| Goal | Help people make better decisions when buying and owning a used car, by turning raw NHTSA data into plain-English risk verdicts and AI-powered diagnoses |
| Users | Primary: used car shoppers researching listings on CarMax, Facebook Marketplace, or Craigslist. Secondary: existing car owners who need honest answers when something goes wrong without getting overcharged |
| Data | NHTSA Government API (recalls, complaints, safety ratings, VIN decoding), free, no key required. Anthropic API (AI synthesis and diagnosis layer), free tier. Both APIs confirmed working and stable. |

---

## Project Goal

Every car research tool available today solves one moment in isolation. 
Carfax covers accident history. KBB covers pricing. NHTSA covers safety 
ratings. None of them connect those signals into a plain-English answer 
to the question every used car buyer actually has: is this specific car, 
at this mileage, at this price, a good decision?

Motor Archive is a two-mode car intelligence tool that follows the user 
across the full ownership lifecycle.

- **Buy Mode,** research before you buy. Paste any VIN and get a risk 
  verdict with clear reasoning, known failure patterns at this mileage, 
  open recalls, and a pre-purchase checklist specific to this model. 
  No account needed to run a lookup. Registration is only required to 
  save a car or access Own Mode.
- **Own Mode,** diagnose after you buy. Save your car, enter a symptom 
  or OBD error code, and get common causes, typical repair costs, and 
  exactly what to tell the mechanic.

The core insight: no existing tool stays useful after you drive off the 
lot. Motor Archive does.

---

## Database Schema

Four collections in MongoDB. All field names use snake_case, which is 
the standard naming convention for MongoDB. Soft deletes used throughout 
to prevent orphaned records.

### Users

| Field | Type | Notes |
|---|---|---|
| _id | ObjectId | Auto-generated primary key |
| name | String | Required |
| email | String | Required, unique index, validated format |
| password | String | Required, bcrypt hashed, never plain text |
| verified | Boolean | Default false, set true on email verification |
| created_at | Date | Auto-set on creation |
| deleted_at | Date | Null by default, soft delete timestamp |

### Cars

| Field | Type | Notes |
|---|---|---|
| _id | ObjectId | Auto-generated |
| user_id | ObjectId | Required, references users collection |
| vin | String | 17 characters, compound unique index with user_id |
| make | String | From NHTSA decode |
| model | String | From NHTSA decode |
| year | Number | From NHTSA decode |
| mileage | Number | User-entered, validated |
| mileage_updated_at | Date | Prompts update if over 30 days old |
| mode | String | Enum: buy or own |
| nickname | String | Optional, e.g. My Civic |
| created_at | Date | Auto-set |
| archived_at | Date | Null by default, soft delete |

### Verdicts (Buy Mode)

| Field | Type | Notes |
|---|---|---|
| _id | ObjectId | Auto-generated |
| car_id | ObjectId | References cars collection |
| status | String | Enum: pending, complete, failed |
| nhtsa_data | Object | Structured JSON with schema_version field |
| ai_verdict | String | Plain-English risk summary |
| risk_level | String | Enum: low, medium, high |
| error_reason | String | Null if successful, populated on failure |
| created_at | Date | Auto-set |
| nhtsa_fetched_at | Date | Timestamp of NHTSA call for freshness display |

### Symptoms  (Own Mode)

| Field | Type | Notes |
|---|---|---|
| _id | ObjectId | Auto-generated |
| car_id | ObjectId | References cars collection |
| user_id | ObjectId | References users collection |
| symptom | String | Minimum 15 characters, validated |
| error_code | String | Optional, OBD format validated |
| ai_response | String | Plain-English diagnosis |
| confidence_level | String | Enum: high, medium, low, shown in UI |
| estimated_cost_range | Object | Split: independent shop vs dealership |
| severity | String | Enum: safe, monitor, do not drive |
| status | String | Enum: open, fixed |
| updated_at | Date | Auto-updated when record changes |
| created_at | Date | Auto-set |

---

## Potential API Issues

### NHTSA API

- API downtime, handled with exponential backoff retry (1s, 2s, 4s), 
  pending verdict record saved, user notified when complete
- Partial data, some models have sparse complaint records. Each data 
  type tracked independently, missing data shown honestly rather than 
  hiding empty sections
- Large complaint volumes, some models have thousands of complaints. 
  Backend summarizes top 50 most recent grouped by system category 
  before sending to AI, preventing context window overflow
- VIN not found, clear message shown with manual entry fallback offered
- Canadian or non-US vehicles, NHTSA covers US-market only, flagged 
  clearly in the UI

### Anthropic API

- API failure after NHTSA success, raw NHTSA data saved immediately. 
  AI synthesis retried independently without re-hitting NHTSA
- Vague or unhelpful AI response, responses under 100 words trigger 
  an automatic retry with a more specific prompt before displaying 
  to user
- Low confidence diagnosis, confidence level stored and displayed 
  visibly in UI, never hidden
- Safety-critical symptoms, keywords like brakes not working or smoke 
  from engine trigger an immediate safety warning before AI response, 
  regardless of confidence level
- Token costs, AI responses cached in database. Same VIN never triggers 
  repeated API calls

### Sensitive Information to Secure

- Passwords, bcrypt hashed with minimum 10 rounds before saving, 
  never logged or stored plain
- JWT secret, stored in environment variable, never committed to GitHub
- MongoDB connection string, stored in environment variable
- Anthropic API key, stored in environment variable
- All environment variables, .env added to .gitignore before first 
  commit, .env.example committed with placeholder values
- Rate limiting on auth endpoints, 5 failed login attempts triggers 
  15 minute lockout
- Input sanitization, all user inputs sanitized server-side before 
  saving, XSS and injection attempts handled

---

## User Flows

### Authentication

- Landing page shows two options: try a VIN lookup (no account needed) 
  or sign up
- Anonymous users can run Buy Mode lookups freely. Results are shown 
  but not saved
- After seeing a verdict, anonymous users are prompted: "Save this car 
  and track it over time, create a free account"
- Sign Up: name, email, password with strength validation. Verification 
  email sent
- Log In: email and password, rate limited. JWT access token (15 min) 
  plus refresh token (7 days) issued on success
- Forgot Password: reset link emailed, expires in 1 hour, all sessions 
  invalidated after reset
- Own Mode requires a registered account, anonymous access not available

### Buy Mode

- Anonymous or logged-in user enters or pastes a VIN on the landing page
- VIN validated for 17 characters and no invalid characters (O, I, Q)
- NHTSA decodes VIN, user confirms make, model, year. Manual entry 
  offered if VIN not found
- User enters listing mileage, age-based plausibility check flags 
  unusual values
- Backend calls recalls, complaints, and safety ratings in parallel
- AI synthesizes structured NHTSA summary into plain-English verdict 
  with risk level and reasoning
- Results page shows: risk level badge, verdict summary, recalls, 
  complaints, pre-purchase checklist, data freshness timestamp
- Anonymous users see a save prompt after results: "Create a free 
  account to save this car and get ownership tools"
- Logged-in users can save directly to their garage

### Own Mode, Adding a Car

- Requires login, anonymous users redirected to sign up
- User adds car via VIN lookup or manual entry (make, model, year, 
  mileage)
- Duplicate detection: if VIN already saved in Buy Mode, app offers 
  to switch it to Own Mode preserving original verdict
- Car appears on dashboard under My Cars

### Own Mode, Logging a Symptom

- User selects a saved car, car details shown prominently. Wrong car 
  escape link always visible
- Mileage staleness check: if mileage_updated_at over 30 days, prompt 
  to update before continuing
- User enters OBD error code (format validated) or describes symptom 
  (minimum 15 characters)
- Safety keyword detection: high-severity symptoms trigger immediate 
  warning before diagnosis
- Duplicate detection: similar symptom within 14 days prompts user 
  to confirm if same issue or new occurrence
- AI generates diagnosis with confidence level, severity indicator, 
  cost range, and what to tell the mechanic
- User can mark as fixed, or save and return later
- Full symptom history visible per car, most recent first, paginated 
  after 10 entries

### Dashboard

- New users see empty state with two clear call-to-action buttons
- Cars I'm Considering section shows up to 10 most recent Buy Mode 
  saves with risk level badge
- My Cars section shows owned cars with last issue date and Log a 
  Symptom button
- I bought this button on any Buy Mode card switches it to Own Mode, 
  prompts mileage confirmation
- Pending verdicts older than 2 hours show failed state with Retry 
  button

---

## Feature Breakdown

### Must-Have Features

| Feature | Type | Difficulty |
|---|---|---|
| Anonymous VIN lookup (no login required) | Fullstack | Medium |
| User Authentication (sign up, log in, forgot password, email verification) | Fullstack | Medium |
| VIN Lookup and NHTSA Vehicle Decoding | Fullstack | Medium |
| Buy Mode, Risk Verdict with AI Synthesis | Fullstack | Hard |
| Pre-Purchase Inspection Checklist (model-specific) | Fullstack | Medium |
| Garage, Save and Manage Cars (requires login) | Fullstack | Medium |
| Own Mode, Symptom Logging and AI Diagnosis | Fullstack | Hard |
| Symptom History and Status Tracking | Fullstack | Medium |

### Stretch Goals

| Feature | Type | Difficulty |
|---|---|---|
| Price vs Market Analysis (is the listing price fair?) | Fullstack | Hard |
| Recall Alerts for Owned Cars (email when new recall issued) | Backend | Hard |
| Share a Verdict (shareable link, expires in 7 days) | Fullstack | Medium |
| Mechanic Mode (formatted symptom history to share with mechanic) | Frontend | Easy |
| Multi-Car Comparison in Buy Mode | Frontend | Medium |
| V2, Image Recognition for Dashboard Warning Lights | Fullstack | Hard |

### What Makes This More Than a CRUD App

- Anonymous VIN lookup lowers the barrier to entry, users see value 
  before being asked to register
- AI synthesis layer turns raw government data into plain-English 
  verdicts with risk reasoning, not just data display
- Model-specific failure pattern analysis at specific mileage 
  thresholds, not generic advice
- Adaptive diagnosis in Own Mode adjusts based on car details, current 
  mileage, and symptom history
- Persistent ownership record across the full car lifecycle, from 
  pre-purchase research to years of ownership
- Safety-critical detection layer that overrides normal flow for 
  dangerous symptoms

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | React with Vite | Bootcamp standard, component architecture maps cleanly to Buy and Own Mode UI |
| Styling | Tailwind CSS | Utility-first, fast to build, consistent design without separate CSS files |
| State | React Context plus useReducer | Right size for this app, avoids Redux overhead while handling auth state across all routes |
| Code Quality | ESLint plus Prettier | Catches errors as you type, consistent formatting, Vite scaffolds ESLint automatically |
| Backend | Node.js with Express | Bootcamp standard, same language both sides reduces context switching while learning |
| Database | MongoDB with Mongoose | Flexible schema suits variable NHTSA data, Mongoose adds validation layer |
| Auth | JWT plus bcrypt | Industry standard for REST API authentication, stateless, pairs well with Express |
| Car Data | NHTSA Government API | Free, stable, government-maintained, covers every US vehicle, no key required |
| AI Layer | Anthropic API | Free tier available, excellent for data synthesis and plain-English generation |
| Frontend Host | Vercel | Free, connects to GitHub, auto-deploys on push to main |
| Backend Host | Render | Free tier, Node support, connects to GitHub |
| Database Host | MongoDB Atlas | Free tier (512MB), reliable, same provider as Mongoose |

---

## Task Breakdown and Timeline

Estimated 52-66 hours total across 8 weeks, within the 45-65 hour 
capstone guideline with a buffer week for reality.

### Week 1, Foundation (8-10 hrs)

| Task | Type | Difficulty | Hours |
|---|---|---|---|
| Set up React with Vite, folder structure, React Router | Frontend | Easy | 2 |
| Set up Node/Express backend, basic route structure | Backend | Easy | 2 |
| Connect MongoDB Atlas, set up Mongoose connection | Backend | Medium | 2 |
| Connect frontend to backend with a test API call | Fullstack | Medium | 2 |
| Set up .env, .gitignore, .env.example, ESLint, Prettier | Backend | Easy | 1 |

End of week goal: frontend loads, backend runs locally, database 
connected, test API call works end to end.

### Week 2, Authentication (8-10 hrs)

| Task | Type | Difficulty | Hours |
|---|---|---|---|
| User model with bcrypt password hashing | Backend | Medium | 2 |
| Sign up, log in, forgot password endpoints with JWT | Backend | Medium | 3 |
| Auth middleware to protect routes | Backend | Medium | 2 |
| Sign up and log in UI in React | Frontend | Medium | 2 |
| AuthContext to manage user state across the app | Fullstack | Medium | 2 |

End of week goal: user can register, log in, log out. Protected routes 
redirect unauthenticated users.

### Week 3, VIN Lookup and NHTSA Data (8-10 hrs)

| Task | Type | Difficulty | Hours |
|---|---|---|---|
| Anonymous VIN lookup endpoint, no auth required | Backend | Medium | 2 |
| NHTSA vPIC decode, recalls, complaints, safety ratings | Backend | Hard | 3 |
| VIN input UI on landing page, no login gate | Frontend | Medium | 2 |
| Display decoded car details for user confirmation | Frontend | Easy | 1 |
| Error handling for NHTSA failures and partial data | Backend | Medium | 2 |

End of week goal: anyone can enter a VIN and get NHTSA data without 
logging in.

### Week 4, AI Verdict and Results (8-10 hrs)

| Task | Type | Difficulty | Hours |
|---|---|---|---|
| Anthropic API integration on backend | Backend | Hard | 3 |
| Verdict generation prompt with structured output | Backend | Hard | 3 |
| Results page UI: risk level badge, verdict, checklist | Frontend | Medium | 3 |
| Save prompt for anonymous users after verdict shown | Frontend | Easy | 1 |

End of week goal: full Buy Mode works end to end for anonymous users. 
VIN in, verdict out.

### Week 5, Garage and Own Mode Setup (8-10 hrs)

| Task | Type | Difficulty | Hours |
|---|---|---|---|
| Car model, garage endpoints, mode switching | Backend | Medium | 2 |
| Dashboard UI: Cars I'm Considering and My Cars sections | Frontend | Medium | 3 |
| Own Mode car addition flow (VIN and manual entry) | Fullstack | Medium | 2 |
| Symptom model and backend endpoints | Backend | Medium | 2 |

End of week goal: logged-in users can save cars, view garage, add 
owned cars.

### Week 6, Symptom Logging and History (6-8 hrs)

| Task | Type | Difficulty | Hours |
|---|---|---|---|
| Symptom logging UI: symptom or OBD entry with validation | Frontend | Medium | 2 |
| AI diagnosis endpoint with safety keyword detection | Backend | Hard | 3 |
| Diagnosis results UI: severity, cost breakdown, mechanic language | Frontend | Medium | 2 |
| Symptom history view per car with status tracking | Frontend | Easy | 2 |

End of week goal: full Own Mode works end to end. Symptom in, 
diagnosis out, history visible.

### Week 7, Polish and Deployment (6-8 hrs)

| Task | Type | Difficulty | Hours |
|---|---|---|---|
| Responsive design pass on all screens | Frontend | Medium | 2 |
| Loading states, error states, empty states throughout | Frontend | Medium | 2 |
| Deploy backend to Render | Backend | Medium | 2 |
| Deploy frontend to Vercel | Frontend | Easy | 1 |
| Connect Atlas to Render, test end to end in production | Fullstack | Medium | 2 |

End of week goal: app deployed and working in production. Share link 
ready for mentor review.

### Week 8, Buffer and Stretch Goals

- Recall alerts for owned cars (Backend, Hard)
- Share a verdict link (Fullstack, Medium)
- Multi-car comparison view (Frontend, Medium)
- README documentation and code cleanup (Easy)

### Total

| Week | Focus | Estimated Hours |
|---|---|---|
| 1 | Foundation | 8-10 |
| 2 | Authentication | 8-10 |
| 3 | VIN and NHTSA | 8-10 |
| 4 | AI Verdict | 8-10 |
| 5 | Garage and Own Mode | 8-10 |
| 6 | Symptom Logging | 6-8 |
| 7 | Polish and Deploy | 6-8 |
| 8 | Buffer and Stretch | Flexible |
| **Total** | | **52-66 hours** |