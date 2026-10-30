// Hunt content. Edit text here; no code changes needed.
// Every step uses the same fields as Section 1.6 of the build spec, so the
// resort version can reuse this format.
window.HUNT_DATA = {
  overrideCode: "2580",
  routes: [
    {
      id: "campus",
      label: "Campus Demo",
      prefix: "CD",
      blurb: "5 safety items in this building",
      steps: [
        {
          id: "campus-01",
          name: "Fire extinguisher",
          task: "Find the nearest fire extinguisher and take a photo of it.",
          target: "a red fire extinguisher, mounted on a wall or in a cabinet",
          hint: "Look on the wall near exits, stairwells and hallway corners. It's a red cylinder in a bracket or glass cabinet.",
          safety_note: "Leave it on the wall. Just take the photo.",
          hazard_card: "Use an extinguisher only on a small fire, only if you're trained, and keep your back to an exit. Remember PASS: Pull, Aim, Squeeze, Sweep. If in doubt, get out and pull the alarm.",
          question: "You're trained and a small fire starts in a trash bin. What's the first step of PASS?",
          choices: ["Aim at the top of the flames", "Pull the pin", "Sweep side to side"],
          answer: 1,
          explanation: "Pull the pin first, then Aim at the base of the fire, Squeeze, and Sweep.",
          checklist_ref: "(i) emergency procedures"
        },
        {
          id: "campus-02",
          name: "Exit sign",
          task: "Find an exit sign and take a photo.",
          target: "an illuminated emergency exit sign",
          hint: "Look up, above doors at the end of hallways and stairwells. Newer signs show a green running figure.",
          safety_note: "Don't stand in a doorway or block foot traffic while you take the photo.",
          hazard_card: "Know two ways out of every area you work in. Exit routes must never be blocked by carts, linen or boxes.",
          question: "A linen cart is parked in front of an exit door. What do you do?",
          choices: ["Leave it, it's not your cart", "Move it if it's safe to, and tell your supervisor", "Use a different exit next time"],
          answer: 1,
          explanation: "A blocked exit is a hazard for everyone. Clear it if you safely can, and report it so it doesn't happen again.",
          checklist_ref: "(c) safety rules, (i) emergency procedures"
        },
        {
          id: "campus-03",
          name: "Fire alarm pull station",
          task: "Find a fire alarm pull station and take a photo.",
          target: "a red fire alarm pull station on a wall",
          hint: "A small red box on the wall, usually right beside an exit door or stairwell, at about shoulder height.",
          safety_note: "Look, don't touch. Pulling it sets off a real alarm.",
          hazard_card: "Pull the alarm for any fire you can't safely put out. Then leave by the nearest exit and go to the muster point. Never use elevators in a fire.",
          question: "You smell smoke and see flames you can't control. What do you do first?",
          choices: ["Finish your task, then check", "Pull the alarm and leave by the nearest exit", "Text your supervisor and wait"],
          answer: 1,
          explanation: "Raising the alarm warns everyone at once. Get out first. Your supervisor will meet you at the muster point.",
          checklist_ref: "(i) emergency procedures"
        },
        {
          id: "campus-04",
          name: "First aid kit",
          task: "Find a first aid kit or first aid station and take a photo.",
          target: "a first aid kit or first aid cabinet, usually white or green with a cross",
          hint: "Check near the main office, reception or a staff room. Look for a white or green box with a cross on it.",
          safety_note: "Don't open the kit, just photograph it.",
          hazard_card: "Report every injury to your supervisor and the first aid attendant during the same shift, even small ones. Small injuries can get worse, and a report protects you.",
          question: "You get a small cut on your finger. What do you do?",
          choices: ["Ignore it, it's small", "Put on a bandage and tell nobody", "Get first aid and report it to your supervisor"],
          answer: 2,
          explanation: "Every injury gets first aid and a report, no matter how small.",
          checklist_ref: "(h) first aid and reporting injuries"
        },
        {
          id: "campus-05",
          name: "Evacuation map",
          task: "Find the evacuation map for this floor and take a photo.",
          target: "a framed building evacuation floor plan with a 'you are here' marker",
          hint: "Usually framed on the wall near elevators, stairwells or the main entrance. Look for 'You are here'.",
          safety_note: "Take a step back so the whole map fits in the photo.",
          hazard_card: "The map shows where you are, the exits, and the muster point. On your first day, find the map in every area you work in.",
          question: "Once you're out of the building during an evacuation, where do you go?",
          choices: ["To your car", "To the muster point shown on the map", "Back to your station once the alarm stops"],
          answer: 1,
          explanation: "Go to the muster point so your supervisor can count everyone. Only go back inside when you're told it's safe.",
          checklist_ref: "(i) emergency procedures"
        }
      ]
    },
    {
      id: "laundry",
      label: "Laundry Attendant",
      prefix: "LA",
      blurb: "6 stations in the laundry (resort version, shown with printed pictures)",
      steps: [
        {
          id: "laundry-01",
          name: "Ironer emergency stop",
          task: "Find the emergency stop button on the ironer and take a photo.",
          target: "a red emergency stop button on industrial laundry equipment",
          hint: "A big red button at the front of the ironer, at hand height.",
          safety_note: "Take the photo from the marked safe spot. The machine must be stopped.",
          hazard_card: "Press this before you clear any jam. Never reach into a moving machine. Only authorized staff clear jams, after lockout.",
          question: "The ironer jams. What do you do first?",
          choices: ["Pull the sheet out", "Press the emergency stop and call your supervisor", "Turn up the heat"],
          answer: 1,
          explanation: "Stopping the machine removes the nip-point hazard. Your supervisor then follows the lockout procedure.",
          checklist_ref: "(d) hazards, (i) emergency procedures, (j) task demonstration"
        },
        {
          id: "laundry-02",
          name: "Dryer lint screen",
          task: "Find the lint screen on a dryer and take a photo.",
          target: "the lint screen or lint drawer of a commercial dryer",
          hint: "At the bottom front of the dryer, behind a small door or drawer.",
          safety_note: "Only open it when the dryer is stopped and has cooled down.",
          hazard_card: "Built-up lint is a fire hazard. Clean the screen on schedule, and only when the dryer is stopped and cool.",
          question: "When do you clean the lint screen?",
          choices: ["While the dryer is running", "On schedule, when the dryer is stopped and cool", "Only when it's completely blocked"],
          answer: 1,
          explanation: "Cleaning on schedule stops lint fires. A stopped, cool dryer keeps your hands safe.",
          checklist_ref: "(d) hazards, (j) task demonstration"
        },
        {
          id: "laundry-03",
          name: "Chemical dosing station",
          task: "Find the chemical dosing station for the washers and take a photo.",
          target: "a wall-mounted chemical dosing pump system with tubes and product containers",
          hint: "Pumps and tubes on the wall behind or beside the washers, with product drums underneath.",
          safety_note: "Stay a step back and don't touch the lines or containers.",
          hazard_card: "Chemicals are dosed automatically. Never mix products or top up by hand unless you're trained. Wear gloves and eye protection near the station.",
          question: "You see a dosing line leaking. What do you do?",
          choices: ["Wipe it up with your bare hands", "Keep clear, warn others, and tell your supervisor (spill procedure)", "Dilute it with water"],
          answer: 1,
          explanation: "Some products burn skin and eyes. Keep people away and let trained staff follow the spill procedure.",
          checklist_ref: "(d) hazards, (g) PPE, (k) WHMIS"
        },
        {
          id: "laundry-04",
          name: "SDS binder",
          task: "Find the Safety Data Sheet (SDS) binder and take a photo.",
          target: "a binder or station labelled Safety Data Sheets / SDS",
          hint: "Usually a labelled binder on a shelf or wall rack near the chemical area or the supervisor's desk.",
          safety_note: "Put the binder back where it was so the next person can find it.",
          hazard_card: "A Safety Data Sheet tells you a product's hazards, the PPE you need, and first aid. Know where the binder is before you handle any chemical.",
          question: "Where do you find out what PPE a chemical needs?",
          choices: ["Guess from the smell", "The product's Safety Data Sheet (SDS)", "Ask a guest"],
          answer: 1,
          explanation: "The SDS and the product label are your WHMIS sources. When in doubt, ask your supervisor.",
          checklist_ref: "(k) WHMIS"
        },
        {
          id: "laundry-05",
          name: "Eyewash station",
          task: "Find the eyewash station and take a photo.",
          target: "an emergency eyewash station, wall-mounted or bottle type, with green signage",
          hint: "Near the chemical area. Look for a green sign with an eye and water.",
          safety_note: "Don't pull the handle. It sprays water.",
          hazard_card: "If a chemical gets in your eyes, go straight to the eyewash and flush for at least 15 minutes, then get first aid and report it.",
          question: "A chemical splashes in your eye. How long do you flush it?",
          choices: ["30 seconds", "At least 15 minutes", "Until it stops stinging"],
          answer: 1,
          explanation: "Flush for at least 15 minutes, even if it feels better sooner, then get first aid.",
          checklist_ref: "(h) first aid, (i) emergency procedures, (k) WHMIS"
        },
        {
          id: "laundry-06",
          name: "Muster point sign",
          task: "Find the muster point sign for your area and take a photo.",
          target: "an outdoor emergency assembly / muster point sign",
          hint: "Outside, a short walk from the building exit. Usually a green sign with people and arrows.",
          safety_note: "Watch for vehicles in the lot.",
          hazard_card: "When the fire alarm goes, stop your machine only if it's safe to, leave by the nearest exit, and check in with your supervisor at the muster point so you're counted.",
          question: "Why do you check in at the muster point?",
          choices: ["So you can go home early", "So your supervisor knows everyone is out", "It's optional"],
          answer: 1,
          explanation: "Supervisors count everyone. Someone missing means a responder might go back in to search.",
          checklist_ref: "(i) emergency procedures"
        }
      ]
    },
    {
      id: "room",
      label: "Room Attendant",
      prefix: "RA",
      blurb: "Coming in the resort version",
      comingSoon: true,
      steps: []
    }
  ]
};
