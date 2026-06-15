import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import { generateEmbedding } from '../src/lib/ai';

const prisma = new PrismaClient();

// Supabase client for vector storage
const supabase = (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY)
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
  : null;

async function main() {
  console.log('🌱 Seeding database with curriculum data...');

  // 1. Create Units
  const units = [
    { code: 'U1', title: 'Green Design', description: 'Renewable energy, eco-materials, sustainability', order: 1, icon: '🌱', color: 'green' },
    { code: 'U2', title: 'Pictorial Projection', description: 'Isometric, oblique, perspective drawing', order: 2, icon: '📐', color: 'blue' },
    { code: 'U3', title: 'Material Technology', description: 'Wood, metals, plastics, boards, tools', order: 3, icon: '🔧', color: 'orange' },
    { code: 'U4', title: 'Electricity and Electronics', description: 'Circuits, components, safety, Ohms law', order: 4, icon: '⚡', color: 'yellow' },
    { code: 'U5', title: 'Orthographic Projection', description: '1st/3rd angle, dimensions, sections', order: 5, icon: '📏', color: 'red' },
    { code: 'U6', title: 'Mechanisms', description: 'Levers, linkages, cams, gears, pulleys', order: 6, icon: '⚙️', color: 'purple' },
    { code: 'U7', title: 'Pneumatics and Hydraulics', description: 'Air/oil systems, components, circuits', order: 7, icon: '💨', color: 'cyan' },
    { code: 'U8', title: 'The Design Process', description: 'Brief, research, ideas, development, evaluation', order: 8, icon: '✏️', color: 'pink' },
  ];

  for (const unit of units) {
    await prisma.unit.upsert({
      where: { code: unit.code },
      update: unit,
      create: unit,
    });
  }
  console.log('✅ Units created');

  // 2. Create Topics (simplified for seed)
  const topics = [
    // Unit 1
    { unitCode: 'U1', code: 'U1-T1', title: 'Renewable Energy Sources', order: 1, difficulty: 'BEGINNER', estimatedMinutes: 30,
      learningObjectives: ['Identify renewable sources in Mauritius', 'Explain how each source works'],
      keyTerms: ['renewable', 'non-renewable', 'solar', 'wind', 'hydro', 'bagasse', 'carbon footprint'] },
    { unitCode: 'U1', code: 'U1-T2', title: 'Solar Power Systems', order: 2, difficulty: 'BEGINNER', estimatedMinutes: 25,
      learningObjectives: ['Describe solar panel operation', 'Explain solar water heater'],
      keyTerms: ['photovoltaic', 'solar collector', 'storage tank'] },
    { unitCode: 'U1', code: 'U1-T3', title: 'Wind & Hydro Power', order: 3, difficulty: 'INTERMEDIATE', estimatedMinutes: 25,
      learningObjectives: ['Identify local wind/hydro sites', 'Explain turbine operation'],
      keyTerms: ['turbine', 'generator', 'penstock', 'trade winds'] },
    { unitCode: 'U1', code: 'U1-T4', title: 'Eco-Materials & Sustainability', order: 4, difficulty: 'BEGINNER', estimatedMinutes: 20,
      learningObjectives: ['Classify eco-materials', 'Identify eco-labels'],
      keyTerms: ['biodegradable', 'recyclable', 'sustainable', 'eco-label'] },

    // Unit 2
    { unitCode: 'U2', code: 'U2-T1', title: 'Isometric Drawing Basics', order: 1, difficulty: 'BEGINNER', estimatedMinutes: 35,
      learningObjectives: ['Draw isometric axes', 'Construct basic shapes'],
      keyTerms: ['isometric', 'axes', '30°', 'true length', 'foreshortening'] },
    { unitCode: 'U2', code: 'U2-T2', title: 'Circles & Arcs in Isometric', order: 2, difficulty: 'INTERMEDIATE', estimatedMinutes: 30,
      learningObjectives: ['Draw circles using four-centre method', 'Construct cylinders'],
      keyTerms: ['four-centre method', 'ellipse', 'cylinder', 'arc'] },
    { unitCode: 'U2', code: 'U2-T3', title: 'Oblique Projection', order: 3, difficulty: 'INTERMEDIATE', estimatedMinutes: 25,
      learningObjectives: ['Differentiate cavalier/cabinet', 'Draw oblique projections'],
      keyTerms: ['cavalier', 'cabinet', 'oblique', 'receding axis', '45°'] },
    { unitCode: 'U2', code: 'U2-T4', title: 'Perspective Drawing', order: 4, difficulty: 'ADVANCED', estimatedMinutes: 30,
      learningObjectives: ['Identify vanishing points', 'Draw 1-point perspective'],
      keyTerms: ['vanishing point', 'horizon line', 'picture plane'] },
    { unitCode: 'U2', code: 'U2-T5', title: 'Tone Shading & Rendering', order: 5, difficulty: 'INTERMEDIATE', estimatedMinutes: 25,
      learningObjectives: ['Apply tone shading', 'Show light direction'],
      keyTerms: ['tone', 'shading', 'highlight', 'shadow', 'texture'] },

    // Unit 3
    { unitCode: 'U3', code: 'U3-T1', title: 'Wood Classification', order: 1, difficulty: 'BEGINNER', estimatedMinutes: 30,
      learningObjectives: ['Classify timber types', 'Identify common Mauritian woods'],
      keyTerms: ['hardwood', 'softwood', 'grain', 'density', 'teak', 'mahogany', 'pine'] },
    { unitCode: 'U3', code: 'U3-T2', title: 'Manufactured Boards', order: 2, difficulty: 'BEGINNER', estimatedMinutes: 25,
      learningObjectives: ['Identify board types', 'Compare properties'],
      keyTerms: ['plywood', 'blockboard', 'chipboard', 'MDF', 'veneer'] },
    { unitCode: 'U3', code: 'U3-T3', title: 'Metals - Ferrous & Non-Ferrous', order: 3, difficulty: 'INTERMEDIATE', estimatedMinutes: 35,
      learningObjectives: ['Differentiate ferrous/non-ferrous', 'State properties'],
      keyTerms: ['ferrous', 'non-ferrous', 'mild steel', 'carbon steel', 'aluminium', 'copper', 'brass'] },
    { unitCode: 'U3', code: 'U3-T4', title: 'Plastics - Thermoplastic vs Thermosetting', order: 4, difficulty: 'INTERMEDIATE', estimatedMinutes: 30,
      learningObjectives: ['Classify plastics', 'Identify recycling codes'],
      keyTerms: ['thermoplastic', 'thermosetting', 'PVC', 'acrylic', 'nylon', 'epoxy', 'polyester resin'] },
    { unitCode: 'U3', code: 'U3-T5', title: 'Cutting & Shaping Tools', order: 5, difficulty: 'BEGINNER', estimatedMinutes: 30,
      learningObjectives: ['Identify cutting tools', 'Select correct tool'],
      keyTerms: ['coping saw', 'tenon saw', 'hack saw', 'jack plane', 'chisel', 'file'] },
    { unitCode: 'U3', code: 'U3-T6', title: 'Holding & Marking Tools', order: 6, difficulty: 'BEGINNER', estimatedMinutes: 25,
      learningObjectives: ['Identify holding tools', 'Use marking tools'],
      keyTerms: ['bench vice', 'G-clamp', 'try square', 'engineer square', 'scriber'] },

    // Unit 4
    { unitCode: 'U4', code: 'U4-T1', title: 'Basic Electrical Concepts', order: 1, difficulty: 'BEGINNER', estimatedMinutes: 30,
      learningObjectives: ['Define V, I, R, P', 'Apply Ohm\'s Law'],
      keyTerms: ['voltage', 'current', 'resistance', 'power', 'Ohm\'s Law', 'circuit'] },
    { unitCode: 'U4', code: 'U4-T2', title: 'Circuit Components & Symbols', order: 2, difficulty: 'BEGINNER', estimatedMinutes: 25,
      learningObjectives: ['Identify component symbols', 'Read simple schematics'],
      keyTerms: ['schematic', 'resistor', 'LED', 'capacitor', 'switch', 'battery', 'breadboard'] },
    { unitCode: 'U4', code: 'U4-T3', title: 'Series & Parallel Circuits', order: 3, difficulty: 'INTERMEDIATE', estimatedMinutes: 30,
      learningObjectives: ['Analyze series circuits', 'Analyze parallel circuits'],
      keyTerms: ['series', 'parallel', 'voltage divider', 'current divider'] },
    { unitCode: 'U4', code: 'U4-T4', title: 'Electrical Safety', order: 4, difficulty: 'BEGINNER', estimatedMinutes: 20,
      learningObjectives: ['State safety rules', 'Explain protection devices'],
      keyTerms: ['earthing', 'fuse', 'RCD', 'live/neutral/earth', '230V', 'isolation'] },

    // Unit 5
    { unitCode: 'U5', code: 'U5-T1', title: 'First & Third Angle Projection', order: 1, difficulty: 'BEGINNER', estimatedMinutes: 30,
      learningObjectives: ['Differentiate 1st/3rd angle', 'Arrange views'],
      keyTerms: ['first angle', 'third angle', 'front view', 'top view', 'side view'] },
    { unitCode: 'U5', code: 'U5-T2', title: 'Dimensions & Tolerances', order: 2, difficulty: 'INTERMEDIATE', estimatedMinutes: 35,
      learningObjectives: ['Apply dimensioning rules', 'State tolerance'],
      keyTerms: ['dimension', 'tolerance', 'limits', 'fits', 'datum'] },
    { unitCode: 'U5', code: 'U5-T3', title: 'Sectional Views', order: 3, difficulty: 'INTERMEDIATE', estimatedMinutes: 30,
      learningObjectives: ['Draw sectional views', 'Apply hatching'],
      keyTerms: ['section', 'hatching', 'cutting plane', 'removed section'] },
    { unitCode: 'U5', code: 'U5-T4', title: 'Assembly Drawings', order: 4, difficulty: 'ADVANCED', estimatedMinutes: 35,
      learningObjectives: ['Create assembly drawing', 'Generate parts list'],
      keyTerms: ['assembly', 'exploded view', 'parts list', 'balloon'] },

    // Unit 6
    { unitCode: 'U6', code: 'U6-T1', title: 'Types of Motion', order: 1, difficulty: 'BEGINNER', estimatedMinutes: 25,
      learningObjectives: ['Identify motion types', 'Convert between motions'],
      keyTerms: ['rotary', 'linear', 'reciprocating', 'oscillating', 'conversion'] },
    { unitCode: 'U6', code: 'U6-T2', title: 'Levers - Three Classes', order: 2, difficulty: 'BEGINNER', estimatedMinutes: 30,
      learningObjectives: ['Classify levers', 'Calculate MA/VR'],
      keyTerms: ['fulcrum', 'effort', 'load', 'mechanical advantage', 'first class', 'second class', 'third class'] },
    { unitCode: 'U6', code: 'U6-T3', title: 'Linkages', order: 3, difficulty: 'INTERMEDIATE', estimatedMinutes: 30,
      learningObjectives: ['Identify linkage types', 'Analyze motion'],
      keyTerms: ['four-bar', 'slider-crank', 'toggle', 'crank', 'coupler'] },
    { unitCode: 'U6', code: 'U6-T4', title: 'Cams & Followers', order: 4, difficulty: 'INTERMEDIATE', estimatedMinutes: 30,
      learningObjectives: ['Identify cam profiles', 'Draw displacement diagram'],
      keyTerms: ['cam', 'follower', 'profile', 'displacement diagram', 'dwell', 'rise', 'return'] },
    { unitCode: 'U6', code: 'U6-T5', title: 'Gears & Pulleys', order: 5, difficulty: 'INTERMEDIATE', estimatedMinutes: 30,
      learningObjectives: ['Calculate gear ratios', 'Analyze pulley systems'],
      keyTerms: ['gear', 'pinion', 'velocity ratio', 'belt drive', 'chain drive', 'sprocket'] },

    // Unit 7
    { unitCode: 'U7', code: 'U7-T1', title: 'Pneumatic System Components', order: 1, difficulty: 'BEGINNER', estimatedMinutes: 30,
      learningObjectives: ['Identify components', 'Read pneumatic symbols'],
      keyTerms: ['compressor', 'reservoir', 'FRL', 'directional valve', 'cylinder', 'silencer'] },
    { topicCode: 'U7-T1', title: 'Pneumatic Circuits', order: 2, difficulty: 'INTERMEDIATE', estimatedMinutes: 35,
      learningObjectives: ['Design basic circuits', 'Control speed'],
      keyTerms: ['single acting', 'double acting', 'flow control', 'sequencing', 'logic valves'] },
    { unitCode: 'U7', code: 'U7-T3', title: 'Hydraulic Systems', order: 3, difficulty: 'INTERMEDIATE', estimatedMinutes: 35,
      learningObjectives: ['Explain Pascal\'s law', 'Calculate force multiplication'],
      keyTerms: ['hydraulic', 'Pascal\'s law', 'force multiplication', 'pump', 'accumulator'] },
    { unitCode: 'U7', code: 'U7-T4', title: 'Applications & Comparison', order: 4, difficulty: 'INTERMEDIATE', estimatedMinutes: 25,
      learningObjectives: ['Compare pneumatic/hydraulic'],
      keyTerms: ['compressibility', 'force', 'speed', 'cleanliness', 'maintenance', 'cost'] },

    // Unit 8
    { unitCode: 'U8', code: 'U8-T1', title: 'Design Brief & Research', order: 1, difficulty: 'BEGINNER', estimatedMinutes: 30,
      learningObjectives: ['Analyze design brief', 'Conduct research'],
      keyTerms: ['design brief', 'specification', 'user needs', 'research', 'mood board'] },
    { unitCode: 'U8', code: 'U8-T2', title: 'Specification & Ideas', order: 2, difficulty: 'BEGINNER', estimatedMinutes: 30,
      learningObjectives: ['Write specification', 'Use idea generation techniques'],
      keyTerms: ['specification', 'criteria', 'constraints', 'brainstorming', 'SCAMPER'] },
    { unitCode: 'U8', code: 'U8-T3', title: 'Development & Modelling', order: 3, difficulty: 'INTERMEDIATE', estimatedMinutes: 35,
      learningObjectives: ['Develop chosen idea', 'Create card models'],
      keyTerms: ['development', 'modelling', 'prototype', 'iteration', 'CAD'] },
    { unitCode: 'U8', code: 'U8-T4', title: 'Planning & Making', order: 4, difficulty: 'INTERMEDIATE', estimatedMinutes: 30,
      learningObjectives: ['Create production plan', 'Write cutting list'],
      keyTerms: ['production plan', 'cutting list', 'sequence', 'quality control', 'jig'] },
    { unitCode: 'U8', code: 'U8-T5', title: 'Testing & Evaluation', order: 5, difficulty: 'INTERMEDIATE', estimatedMinutes: 30,
      learningObjectives: ['Test against specification', 'Conduct user trials'],
      keyTerms: ['testing', 'evaluation', 'specification', 'user trial', 'improvement'] },
  ];

  // Fix: handle the typo in one topic
  const fixedTopics = topics.map(t => {
    if ('topicCode' in t) {
      return { ...t, unitCode: t.topicCode };
    }
    return t;
  });

  for (const topic of fixedTopics) {
    const unit = await prisma.unit.findUnique({ where: { code: topic.unitCode } });
    if (!unit) continue;

    await prisma.topic.upsert({
      where: { unitId_code: { unitId: unit.id, code: topic.code! } },
      update: {
        title: topic.title,
        description: (topic as any).description || '',
        order: topic.order,
        difficulty: topic.difficulty as any,
        estimatedMinutes: topic.estimatedMinutes,
        learningObjectives: topic.learningObjectives,
        keyTerms: topic.keyTerms,
      },
      create: {
        unitId: unit.id,
        code: topic.code,
        title: topic.title,
        description: (topic as any).description || '',
        order: topic.order,
        difficulty: topic.difficulty as any,
        estimatedMinutes: topic.estimatedMinutes,
        learningObjectives: topic.learningObjectives,
        keyTerms: topic.keyTerms,
      },
    });
  }
  console.log('✅ Topics created');

  // 3. Create Badges
  const badges = [
    { code: 'first_steps', name: 'First Steps', description: 'Complete your first topic', icon: '🌱', color: 'green', category: 'LEARNING', criteria: { type: 'topic_complete', count: 1 }, xpReward: 50 },
    { code: 'green_designer', name: 'Green Designer', description: 'Master Unit 1: Green Design', icon: '🌿', color: 'green', category: 'MASTERY', criteria: { type: 'unit_complete', unitCode: 'U1' }, xpReward: 100 },
    { code: 'projection_pro', name: 'Projection Pro', description: 'Master Unit 2', icon: '📐', color: 'blue', category: 'MASTERY', criteria: { type: 'unit_complete', unitCode: 'U2' }, xpReward: 100 },
    { code: 'material_master', name: 'Material Master', description: 'Master Unit 3', icon: '🔧', color: 'orange', category: 'MASTERY', criteria: { type: 'unit_complete', unitCode: 'U3' }, xpReward: 100 },
    { code: 'circuit_whiz', name: 'Circuit Whiz', description: 'Master Unit 4', icon: '⚡', color: 'yellow', category: 'MASTERY', criteria: { type: 'unit_complete', unitCode: 'U4' }, xpReward: 100 },
    { code: 'ortho_expert', name: 'Orthographic Expert', description: 'Master Unit 5', icon: '📏', color: 'red', category: 'MASTERY', criteria: { type: 'unit_complete', unitCode: 'U5' }, xpReward: 100 },
    { code: 'mechanism_master', name: 'Mechanism Master', description: 'Master Unit 6', icon: '⚙️', color: 'purple', category: 'MASTERY', criteria: { type: 'unit_complete', unitCode: 'U6' }, xpReward: 100 },
    { code: 'fluid_power', name: 'Fluid Power', description: 'Master Unit 7', icon: '💨', color: 'cyan', category: 'MASTERY', criteria: { type: 'unit_complete', unitCode: 'U7' }, xpReward: 100 },
    { code: 'design_thinker', name: 'Design Thinker', description: 'Master Unit 8', icon: '✏️', color: 'pink', category: 'MASTERY', criteria: { type: 'unit_complete', unitCode: 'U8' }, xpReward: 100 },
    { code: 'quiz_champion', name: 'Quiz Champion', description: 'Score 90%+ on 10 quizzes', icon: '🏆', color: 'gold', category: 'QUIZ', criteria: { type: 'quiz_high_score', count: 10 }, xpReward: 200 },
    { code: 'exam_ready', name: 'Exam Ready', description: 'Complete 3 mock exams', icon: '📝', color: 'blue', category: 'EXAM', criteria: { type: 'mock_exams', count: 3 }, xpReward: 300 },
    { code: 'streak_7', name: 'Week Warrior', description: '7-day learning streak', icon: '🔥', color: 'orange', category: 'STREAK', criteria: { type: 'streak', days: 7 }, xpReward: 100 },
    { code: 'streak_30', name: 'Month Master', description: '30-day learning streak', icon: '🔥', color: 'red', category: 'STREAK', criteria: { type: 'streak', days: 30 }, xpReward: 500 },
    { code: 'perfectionist', name: 'Perfectionist', description: '100% on 5 quizzes without hints', icon: '💎', color: 'purple', category: 'QUIZ', criteria: { type: 'quiz_perfect', count: 5 }, xpReward: 150 },
    { code: 'night_owl', name: 'Night Owl', description: 'Study after 10 PM 10 times', icon: '🦉', color: 'indigo', category: 'SPECIAL', criteria: { type: 'time_based', hour: 22, count: 10 }, xpReward: 50 },
    { code: 'early_bird', name: 'Early Bird', description: 'Study before 7 AM 10 times', icon: '🌅', color: 'yellow', category: 'SPECIAL', criteria: { type: 'time_based', hour: 7, count: 10 }, xpReward: 50 },
  ];

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { code: badge.code },
      update: badge,
      create: badge,
    });
  }
  console.log('✅ Badges created');

  // 4. Create Formulas
  const formulas = [
    { topicCode: 'U4-T1', name: 'Ohm\'s Law', formula: 'V = I \\times R', description: 'Voltage = Current × Resistance', variables: { V: 'Voltage (volts)', I: 'Current (amperes)', R: 'Resistance (ohms)' }, unit: 'volts' },
    { topicCode: 'U4-T1', name: 'Electrical Power', formula: 'P = V \\times I', description: 'Power = Voltage × Current', variables: { P: 'Power (watts)', V: 'Voltage (volts)', I: 'Current (amperes)' }, unit: 'watts' },
    { topicCode: 'U4-T1', name: 'Energy', formula: 'E = P \\times t', description: 'Energy = Power × Time', variables: { E: 'Energy (joules)', P: 'Power (watts)', t: 'Time (seconds)' }, unit: 'joules' },
    { topicCode: 'U4-T3', name: 'Series Resistance', formula: 'R_{total} = R_1 + R_2 + R_3 + ...', description: 'Total resistance in series', variables: { R_total: 'Total resistance', R_1: 'Resistor 1', R_2: 'Resistor 2' }, unit: 'ohms' },
    { topicCode: 'U4-T3', name: 'Parallel Resistance', formula: '\\frac{1}{R_{total}} = \\frac{1}{R_1} + \\frac{1}{R_2} + ...', description: 'Total resistance in parallel', variables: { R_total: 'Total resistance', R_1: 'Resistor 1', R_2: 'Resistor 2' }, unit: 'ohms' },
    { topicCode: 'U1-T2', name: 'Carbon Footprint (Electricity)', formula: 'CO_2 (kg) = kWh \\times 0.85', description: 'Mauritius grid emission factor', variables: { kWh: 'Electricity consumed (kWh)', '0.85': 'Emission factor (kg CO₂/kWh)' }, unit: 'kg CO₂' },
    { topicCode: 'U1-T2', name: 'Energy Consumption', formula: 'Wh = Watts \\times Hours', description: 'Daily energy use per appliance', variables: { Watts: 'Power rating (watts)', Hours: 'Hours used per day' }, unit: 'Wh' },
    { topicCode: 'U1-T2', name: 'Solar Panel Output', formula: 'kWh/day = Panel\\ kW \\times Sun\\ Hours \\times 0.75', description: 'With 75% system efficiency', variables: { 'Panel kW': 'Rated panel power (kW)', 'Sun Hours': 'Peak sun hours per day', '0.75': 'System efficiency (75%)' }, unit: 'kWh' },
    { topicCode: 'U6-T2', name: 'Mechanical Advantage (Lever)', formula: 'MA = \\frac{Effort\\ Arm}{Load\\ Arm}', description: 'Ratio of effort distance to load distance', variables: { 'Effort Arm': 'Distance from fulcrum to effort', 'Load Arm': 'Distance from fulcrum to load' }, unit: 'ratio' },
    { topicCode: 'U6-T5', name: 'Gear Velocity Ratio', formula: 'VR = \\frac{Teeth\\ on\\ driven\\ gear}{Teeth\\ on\\ driver\\ gear}', description: 'Gear train ratio', variables: { 'Driven teeth': 'Teeth on output gear', 'Driver teeth': 'Teeth on input gear' }, unit: 'ratio' },
    { topicCode: 'U6-T5', name: 'Pulley Velocity Ratio', formula: 'VR = Number\\ of\\ supporting\\ ropes', description: 'Pulley system ratio', variables: { 'Supporting ropes': 'Count of rope segments holding load' }, unit: 'ratio' },
  ];

  for (const formula of formulas) {
    const topic = await prisma.topic.findFirst({ where: { code: formula.topicCode } });
    if (!topic) continue;

    await prisma.formula.upsert({
      where: { id: `formula-${topic.id}-${formula.name.replace(/[^a-zA-Z0-9]/g, '-')}` },
      update: { name: formula.name, formula: formula.formula, description: formula.description, variables: formula.variables, unit: formula.unit },
      create: { id: `formula-${topic.id}-${formula.name.replace(/[^a-zA-Z0-9]/g, '-')}`, topicId: topic.id, name: formula.name, formula: formula.formula, description: formula.description, variables: formula.variables, unit: formula.unit },
    });
  }
  console.log('✅ Formulas created');

  // 5. Create Flashcards
  const flashcards = [
    { topicCode: 'U1-T1', front: 'What is Green Design?', back: 'Creating products/systems that are environmentally friendly - meeting present needs without compromising future generations.', difficulty: 'BEGINNER' },
    { topicCode: 'U1-T1', front: 'Name 4 renewable energy sources used in Mauritius', back: '1. Solar 2. Wind 3. Hydroelectric 4. Bagasse (sugar cane waste)', difficulty: 'BEGINNER' },
    { topicCode: 'U1-T1', front: 'What is bagasse?', back: 'Fibrous residue left after crushing sugar cane, burned as biomass fuel to generate electricity and heat.', difficulty: 'BEGINNER' },
    { topicCode: 'U1-T1', front: 'What percentage of Mauritius\' electricity comes from bagasse?', back: 'Approximately 15%', difficulty: 'INTERMEDIATE' },
    { topicCode: 'U1-T1', front: 'Mauritius renewable energy target for 2030', back: '60% renewable energy by 2030', difficulty: 'BEGINNER' },
    { topicCode: 'U1-T1', front: 'What does CEB stand for?', back: 'Central Electricity Board - manages Mauritius power grid', difficulty: 'BEGINNER' },
    { topicCode: 'U1-T1', front: 'Define carbon footprint', back: 'Total greenhouse gas emissions caused directly and indirectly by an activity, measured in kg CO₂ equivalent.', difficulty: 'INTERMEDIATE' },
    { topicCode: 'U1-T1', front: 'Formula: Carbon footprint from electricity', back: 'CO₂ (kg) = kWh × 0.85 (Mauritius grid emission factor)', difficulty: 'INTERMEDIATE' },
    { topicCode: 'U2-T1', front: 'What angle are isometric axes drawn at?', back: '30° to the horizontal', difficulty: 'BEGINNER' },
    { topicCode: 'U2-T1', front: 'What is the true length in isometric projection?', back: 'Lines parallel to isometric axes are drawn at true length', difficulty: 'BEGINNER' },
    { topicCode: 'U2-T2', front: 'What method is used to draw circles in isometric?', back: 'Four-centre method (also called four-center method)', difficulty: 'INTERMEDIATE' },
    { topicCode: 'U2-T3', front: 'Difference between cavalier and cabinet oblique?', back: 'Cavalier: receding lines at full scale. Cabinet: receding lines at half scale.', difficulty: 'INTERMEDIATE' },
    { topicCode: 'U3-T1', front: 'Name 3 hardwoods used in Mauritius', back: 'Teak, Mahogany, Rosewood', difficulty: 'BEGINNER' },
    { topicCode: 'U3-T1', front: 'Name 3 softwoods', back: 'Pine, Cedar, Fir', difficulty: 'BEGINNER' },
    { topicCode: 'U3-T2', front: 'What is MDF made from?', back: 'Wood fibres mixed with resin and wax, compressed under heat and pressure', difficulty: 'BEGINNER' },
    { topicCode: 'U3-T3', front: 'Which metals are magnetic (ferrous)?', back: 'Iron, steel, nickel, cobalt - mild steel, carbon steel', difficulty: 'BEGINNER' },
    { topicCode: 'U3-T3', front: 'Which metal is used for cooking foil?', back: 'Aluminium', difficulty: 'BEGINNER' },
    { topicCode: 'U3-T4', front: 'PVC - thermoplastic or thermosetting?', back: 'Thermoplastic - softens on heating, can be reshaped', difficulty: 'BEGINNER' },
    { topicCode: 'U3-T4', front: 'Epoxy resin - thermoplastic or thermosetting?', back: 'Thermosetting - permanently sets on curing, cannot be melted', difficulty: 'BEGINNER' },
    { topicCode: 'U4-T1', front: 'Ohm\'s Law formula', back: 'V = I × R (Voltage = Current × Resistance)', difficulty: 'BEGINNER' },
    { topicCode: 'U4-T1', front: 'Power formula', back: 'P = V × I (Power = Voltage × Current)', difficulty: 'BEGINNER' },
    { topicCode: 'U4-T3', front: 'Total resistance in series', back: 'R_total = R₁ + R₂ + R₃ + ...', difficulty: 'INTERMEDIATE' },
    { topicCode: 'U4-T3', front: 'Total resistance in parallel', back: '1/R_total = 1/R₁ + 1/R₂ + 1/R₃ + ...', difficulty: 'INTERMEDIATE' },
    { topicCode: 'U5-T1', front: 'Third angle projection - view arrangement', back: 'Top view above front, right side view to right of front', difficulty: 'BEGINNER' },
    { topicCode: 'U6-T1', front: 'Four types of motion', back: 'Rotary, Linear, Reciprocating, Oscillating', difficulty: 'BEGINNER' },
    { topicCode: 'U6-T2', front: 'First class lever - fulcrum position', back: 'Fulcrum between effort and load (e.g., seesaw, scissors)', difficulty: 'BEGINNER' },
    { topicCode: 'U6-T2', front: 'Second class lever - load position', back: 'Load between fulcrum and effort (e.g., wheelbarrow, nutcracker)', difficulty: 'BEGINNER' },
    { topicCode: 'U6-T2', front: 'Third class lever - effort position', back: 'Effort between fulcrum and load (e.g., tweezers, human arm)', difficulty: 'BEGINNER' },
    { topicCode: 'U7-T1', front: 'Pneumatics vs Hydraulics - fluid', back: 'Pneumatics: compressed air. Hydraulics: oil (incompressible)', difficulty: 'INTERMEDIATE' },
    { topicCode: 'U8-T1', front: 'Design process - 8 steps', back: '1. Brief 2. Research 3. Specification 4. Ideas 5. Development 6. Planning 7. Making 8. Evaluation', difficulty: 'BEGINNER' },
  ];

  for (const fc of flashcards) {
    const topic = await prisma.topic.findFirst({ where: { code: fc.topicCode } });
    if (!topic) continue;

    await prisma.flashcard.upsert({
      where: { id: `fc-${topic.id}-${fc.front.replace(/[^a-zA-Z0-9]/g, '-').slice(0, 50)}` },
      update: { front: fc.front, back: fc.back, difficulty: fc.difficulty as any },
      create: { id: `fc-${topic.id}-${fc.front.replace(/[^a-zA-Z0-9]/g, '-').slice(0, 50)}`, topicId: topic.id, front: fc.front, back: fc.back, difficulty: fc.difficulty as any },
    });
  }
  console.log('✅ Flashcards created');

  // 6. Create Quiz Questions (sample)
  const quizQuestions = [
    { topicCode: 'U1-T1', type: 'MULTIPLE_CHOICE', difficulty: 'BEGINNER', question: 'Which of the following is a renewable energy source used in Mauritius?', options: { choices: ['Coal', 'Bagasse', 'Diesel', 'Natural Gas'] }, correctAnswer: 'Bagasse', explanation: 'Bagasse is sugar cane waste - a biomass renewable energy source.', hints: ['Think about sugar cane by-products'], marks: 1, examRelevance: 0.9, tags: ['renewable', 'bagasse', 'mauritius'] },
    { topicCode: 'U1-T1', type: 'TRUE_FALSE', difficulty: 'BEGINNER', question: 'Solar panels convert wind energy into electrical energy.', correctAnswer: false, explanation: 'Solar panels convert sunlight (solar energy) into electrical energy. Wind turbines convert wind energy.', hints: ['What does "solar" refer to?'], marks: 1, examRelevance: 0.8, tags: ['solar', 'energy conversion'] },
    { topicCode: 'U1-T1', type: 'FILL_IN_BLANKS', difficulty: 'BEGINNER', question: 'The ________ is the fibrous residue left after crushing sugar cane.', correctAnswer: 'bagasse', explanation: 'Bagasse is the dry pulpy residue after juice extraction from sugar cane.', hints: ['It\'s a biomass fuel'], marks: 1, examRelevance: 0.9, tags: ['bagasse', 'sugar cane'] },
    { topicCode: 'U1-T1', type: 'MULTIPLE_CHOICE', difficulty: 'BEGINNER', question: 'Mauritius\' target for renewable energy by 2030 is:', options: { choices: ['40%', '50%', '60%', '70%'] }, correctAnswer: '60%', explanation: 'Mauritius aims for 60% renewable energy by 2030.', hints: ['It\'s more than half'], marks: 1, examRelevance: 0.7, tags: ['target', 'policy'] },
    { topicCode: 'U2-T1', type: 'MULTIPLE_CHOICE', difficulty: 'BEGINNER', question: 'In isometric projection, what angle do the axes make with the horizontal?', options: { choices: ['15°', '30°', '45°', '60°'] }, correctAnswer: '30°', explanation: 'Isometric axes are drawn at 30° to the horizontal.', hints: ['Think of a 30-60-90 triangle'], marks: 1, examRelevance: 0.9, tags: ['isometric', 'drawing'] },
    { topicCode: 'U2-T2', type: 'MULTIPLE_CHOICE', difficulty: 'INTERMEDIATE', question: 'Which method is used to draw a circle in isometric projection?', options: { choices: ['Two-centre method', 'Four-centre method', 'Six-centre method', 'Compass method'] }, correctAnswer: 'Four-centre method', explanation: 'The four-centre method uses four arcs with different radii to approximate a circle in isometric.', hints: ['It uses four arcs'], marks: 1, examRelevance: 1.0, tags: ['isometric', 'circle', 'construction'] },
    { topicCode: 'U3-T3', type: 'TRUE_FALSE', difficulty: 'BEGINNER', question: 'Aluminium is a ferrous metal.', correctAnswer: false, explanation: 'Aluminium is non-ferrous - it is not magnetic and does not contain iron.', hints: ['Ferrous = contains iron'], marks: 1, examRelevance: 0.9, tags: ['metals', 'ferrous', 'aluminium'] },
    { topicCode: 'U3-T4', type: 'MULTIPLE_CHOICE', difficulty: 'INTERMEDIATE', question: 'Which of the following is a thermosetting plastic?', options: { choices: ['PVC', 'Acrylic', 'Polyester resin', 'Nylon'] }, correctAnswer: 'Polyester resin', explanation: 'Polyester resin permanently cross-links on curing. PVC, Acrylic, and Nylon are thermoplastics.', hints: ['Thermosetting = permanent cross-linking'], marks: 1, examRelevance: 0.8, tags: ['plastics', 'thermosetting'] },
    { topicCode: 'U4-T1', type: 'FILL_IN_BLANKS', difficulty: 'BEGINNER', question: 'Ohm\'s Law states: V = I × _______', correctAnswer: 'R', explanation: 'V = I × R (Voltage = Current × Resistance)', hints: ['It represents opposition to current flow'], marks: 1, examRelevance: 1.0, tags: ['ohm\'s law', 'resistance'] },
    { topicCode: 'U6-T1', type: 'MULTIPLE_CHOICE', difficulty: 'BEGINNER', question: 'Which type of motion follows a circular path?', options: { choices: ['Linear', 'Rotary', 'Reciprocating', 'Oscillating'] }, correctAnswer: 'Rotary', explanation: 'Rotary motion follows a circle around a fixed center.', hints: ['Think of a wheel'], marks: 1, examRelevance: 0.9, tags: ['motion', 'rotary'] },
  ];

  for (const q of quizQuestions) {
    const topic = await prisma.topic.findFirst({ where: { code: q.topicCode } });
    if (!topic) continue;

    await prisma.quizQuestion.upsert({
      where: { id: `quiz-${topic.id}-${q.question.replace(/[^a-zA-Z0-9]/g, '-').slice(0, 50)}` },
      update: { type: q.type as any, difficulty: q.difficulty as any, question: q.question, options: q.options, correctAnswer: q.correctAnswer, explanation: q.explanation, hints: q.hints, marks: q.marks, examRelevance: q.examRelevance, tags: q.tags },
      create: { id: `quiz-${topic.id}-${q.question.replace(/[^a-zA-Z0-9]/g, '-').slice(0, 50)}`, topicId: topic.id, type: q.type as any, difficulty: q.difficulty as any, question: q.question, options: q.options, correctAnswer: q.correctAnswer, explanation: q.explanation, hints: q.hints, marks: q.marks, examRelevance: q.examRelevance, tags: q.tags },
    });
  }
  console.log('✅ Quiz questions created');

  // 7. Create Exam Papers & Questions
  const examPapers = [
    { year: 2023, title: 'NCE 2023 Technology Studies Component 1', totalMarks: 80, durationMins: 90 },
    { year: 2024, title: 'NCE 2024 Technology Studies Design & Tech', totalMarks: 80, durationMins: 90 },
    { year: 2025, title: 'NCE 2025 Tech Studies Component 1 QP', totalMarks: 80, durationMins: 90 },
  ];

  for (const paper of examPapers) {
    const existing = await prisma.examPaper.findFirst({ where: { year: paper.year } });
    if (existing) continue;

    await prisma.examPaper.create({
      data: {
        ...paper,
        component: 'Component 1',
        isActive: true,
      },
    });
  }
  console.log('✅ Exam papers created');

  // 8. Populate Supabase embeddings (if configured)
  if (supabase) {
    console.log('📦 Populating Supabase embeddings...');
    const allChunks = await prisma.contentChunk.findMany({
      include: { topic: { include: { unit: true } } },
    });

    if (allChunks.length > 0) {
      for (const chunk of allChunks) {
        try {
          const embedding = await generateEmbedding(chunk.content);
          await supabase.from('content_embeddings').upsert({
            id: chunk.id,
            topic_id: chunk.topicId,
            content: chunk.content,
            embedding: embedding,
            metadata: chunk.metadata,
            chunk_index: chunk.chunkIndex,
            token_count: chunk.tokenCount,
          }, { onConflict: 'id' });
        } catch (e) {
          console.log(`Failed to embed chunk ${chunk.id}:`, (e as Error).message);
        }
      }
      console.log(`✅ Synced ${allChunks.length} embeddings to Supabase`);
    }
  } else {
    console.log('⚠️ Supabase not configured - skipping vector sync');
  }

  console.log('🎉 Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });