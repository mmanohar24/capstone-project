# RaceDay

I use a Whoop. Have for over a year. It tracks my sleep, recovery, 
strain, and gives me a score every morning. I've almost never made 
a decision based on it. Not because the data is bad, but because no 
app tells me what to actually do with it.

Same story with Fitbod. It logs my workouts. It tells me what to do 
next at the gym. But it has no idea whether my legs are too wrecked 
from yesterday's run to do heavy squats today. The apps don't talk 
to each other. None of them connect to a goal. The data just sits 
there.

RaceDay is built around a simple idea: data only means something 
when it's connected to what you're trying to achieve.

You set a goal, a race, a target pace, a distance you want to hit 
by a certain date. The app builds a training plan to get you there. 
Every day you do a quick check-in: how did your body feel? The AI 
uses that to adjust tomorrow's session. Bad night's sleep and heavy 
legs? Today becomes an easy 20 minutes instead of the tempo run. 
That's not the app going soft on you, that's it understanding that 
one skipped hard session now is better than an injury that costs 
you three weeks.

When race day or goal day arrives, you get a plan built for that 
specific day, weather conditions at your location, course elevation 
if it's a race, a realistic finish time based on your actual 
training (not your wishful thinking), and a pacing strategy for 
each segment.

## Data
- Open-Meteo API, free weather and elevation data, no API key 
  needed, updates hourly
- Anthropic API, generates the training plan and adapts it based 
  on daily check-ins