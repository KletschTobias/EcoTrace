-- Predefined Activities
INSERT INTO activities (id, name, category, co2_per_unit, water_per_unit, electricity_per_unit, unit, icon, description) VALUES 
(nextval('activities_seq'), 'Car Drive', 'transport', 0.192, 0.0, 0.0, 'km', '🚗', 'Driving a gasoline car'),
(nextval('activities_seq'), 'Electric Car', 'transport', 0.053, 0.0, 0.3, 'km', '⚡', 'Driving an electric vehicle'),
(nextval('activities_seq'), 'Bus Ride', 'transport', 0.089, 0.0, 0.0, 'km', '🚌', 'Taking public bus transportation'),
(nextval('activities_seq'), 'Train Journey', 'transport', 0.041, 0.0, 0.0, 'km', '🚆', 'Traveling by train'),
(nextval('activities_seq'), 'Flight', 'transport', 0.255, 0.0, 0.0, 'km', '✈️', 'Air travel'),
(nextval('activities_seq'), 'Cycling', 'transport', 0.0, 0.0, 0.0, 'km', '🚴', 'Riding a bicycle'),
(nextval('activities_seq'), 'Walking', 'transport', 0.0, 0.0, 0.0, 'km', '🚶', 'Walking'),

(nextval('activities_seq'), 'Shower', 'home', 0.5, 50.0, 1.5, 'minutes', '🚿', 'Taking a shower'),
(nextval('activities_seq'), 'Bath', 'home', 0.8, 150.0, 2.5, 'times', '🛁', 'Taking a bath'),
(nextval('activities_seq'), 'Dishwasher', 'home', 0.8, 15.0, 1.5, 'times', '🍽️', 'Running dishwasher'),
(nextval('activities_seq'), 'Washing Machine', 'home', 0.6, 50.0, 0.9, 'times', '👕', 'Doing laundry'),
(nextval('activities_seq'), 'Heating', 'home', 5.0, 0.0, 10.0, 'hours', '🔥', 'Using central heating'),
(nextval('activities_seq'), 'Air Conditioning', 'home', 4.0, 0.0, 8.0, 'hours', '❄️', 'Using air conditioning'),
(nextval('activities_seq'), 'Computer Usage', 'home', 0.3, 0.0, 0.5, 'hours', '💻', 'Using desktop computer'),
(nextval('activities_seq'), 'TV Watching', 'home', 0.2, 0.0, 0.15, 'hours', '📺', 'Watching television'),

(nextval('activities_seq'), 'Beef Meal', 'food', 27.0, 15415.0, 0.0, 'times', '🥩', 'Eating beef'),
(nextval('activities_seq'), 'Chicken Meal', 'food', 6.9, 4325.0, 0.0, 'times', '🍗', 'Eating chicken'),
(nextval('activities_seq'), 'Fish Meal', 'food', 6.1, 3918.0, 0.0, 'times', '🐟', 'Eating fish'),
(nextval('activities_seq'), 'Vegetarian Meal', 'food', 2.0, 322.0, 0.0, 'times', '🥗', 'Eating vegetarian food'),
(nextval('activities_seq'), 'Vegan Meal', 'food', 1.5, 287.0, 0.0, 'times', '🌱', 'Eating vegan food'),
(nextval('activities_seq'), 'Coffee', 'food', 0.1, 140.0, 0.0, 'times', '☕', 'Drinking coffee'),
(nextval('activities_seq'), 'Tea', 'food', 0.02, 27.0, 0.0, 'times', '🍵', 'Drinking tea'),

(nextval('activities_seq'), 'New Clothes', 'shopping', 6.0, 2700.0, 0.0, 'items', '👔', 'Buying new clothing'),
(nextval('activities_seq'), 'New Electronics', 'shopping', 50.0, 1000.0, 0.0, 'items', '📱', 'Buying new electronics'),
(nextval('activities_seq'), 'Online Shopping', 'shopping', 1.5, 0.0, 0.0, 'items', '📦', 'Online package delivery'),
(nextval('activities_seq'), 'Grocery Shopping', 'shopping', 0.5, 50.0, 0.0, 'times', '🛒', 'Shopping for groceries'),

(nextval('activities_seq'), 'Plastic Bottle', 'other', 0.08, 0.0, 0.0, 'items', '🧴', 'Using plastic bottle'),
(nextval('activities_seq'), 'Paper Usage', 'other', 0.004, 10.0, 0.0, 'sheets', '📄', 'Using paper'),
(nextval('activities_seq'), 'Recycling', 'other', -0.5, 0.0, 0.0, 'kg', '♻️', 'Recycling waste'),
(nextval('activities_seq'), 'Composting', 'other', -0.3, 0.0, 0.0, 'kg', '🌿', 'Composting organic waste');

-- Achievements
INSERT INTO achievements (id, name, description, icon, category, target_value, target_type, specific_activity, badge_color, points) VALUES
(nextval('achievements_seq'), 'First Steps', 'Log your first environmental activity', '🌱', 'MILESTONE', 1, 'ACTIVITY_COUNT', null, '#10B981', 10),
(nextval('achievements_seq'), 'Getting Started', 'Log 5 environmental activities', '🌿', 'MILESTONE', 5, 'ACTIVITY_COUNT', null, '#10B981', 20),
(nextval('achievements_seq'), 'Habit Former', 'Log 10 environmental activities', '🌳', 'MILESTONE', 10, 'ACTIVITY_COUNT', null, '#10B981', 30),
(nextval('achievements_seq'), 'Eco Warrior', 'Log 25 environmental activities', '🏆', 'MILESTONE', 25, 'ACTIVITY_COUNT', null, '#F59E0B', 50),
(nextval('achievements_seq'), 'Environmental Champion', 'Log 50 environmental activities', '👑', 'MILESTONE', 50, 'ACTIVITY_COUNT', null, '#EF4444', 100),

(nextval('achievements_seq'), 'Pedal Power', 'Cycle 10 times', '🚴', 'ACTIVITY', 10, 'SPECIFIC_ACTIVITY', 'Cycling', '#3B82F6', 25),
(nextval('achievements_seq'), 'Walker', 'Walk 10 times', '🚶', 'ACTIVITY', 10, 'SPECIFIC_ACTIVITY', 'Walking', '#8B5CF6', 25),
(nextval('achievements_seq'), 'Green Commuter', 'Use public transport 15 times', '🚌', 'ACTIVITY', 15, 'SPECIFIC_ACTIVITY', 'Bus Ride', '#06B6D4', 30),
(nextval('achievements_seq'), 'Recycling Hero', 'Recycle or compost 20 times', '♻️', 'ACTIVITY', 20, 'SPECIFIC_ACTIVITY', 'Recycling', '#10B981', 35),

(nextval('achievements_seq'), 'Week Warrior', 'Log activities for 7 consecutive days', '📅', 'STREAK', 7, 'DAYS_STREAK', null, '#8B5CF6', 40),
(nextval('achievements_seq'), 'Consistency King', 'Log activities for 14 consecutive days', '📆', 'STREAK', 14, 'DAYS_STREAK', null, '#8B5CF6', 60),
(nextval('achievements_seq'), 'Dedication Master', 'Log activities for 30 consecutive days', '🔥', 'STREAK', 30, 'DAYS_STREAK', null, '#EF4444', 100),

(nextval('achievements_seq'), 'Social Butterfly', 'Add 3 friends', '👥', 'SOCIAL', 3, 'FRIENDS_COUNT', null, '#EC4899', 25),
(nextval('achievements_seq'), 'Community Builder', 'Add 5 friends', '👫', 'SOCIAL', 5, 'FRIENDS_COUNT', null, '#EC4899', 40),
(nextval('achievements_seq'), 'Network Effect', 'Add 10 friends', '🌐', 'SOCIAL', 10, 'FRIENDS_COUNT', null, '#EC4899', 60),

(nextval('achievements_seq'), 'Low Carbon Hero', 'Keep total CO2 under 100kg', '🌍', 'CO2_REDUCTION', 100, 'LOW_CO2', null, '#10B981', 50),
(nextval('achievements_seq'), 'Carbon Neutral', 'Keep total CO2 under 50kg', '🌏', 'CO2_REDUCTION', 50, 'LOW_CO2', null, '#10B981', 75),
(nextval('achievements_seq'), 'Planet Saver', 'Keep total CO2 under 25kg', '🌎', 'CO2_REDUCTION', 25, 'LOW_CO2', null, '#10B981', 100);

-- Create permanent public league (Requires a system user as host)
-- Note: This assumes user with id 1 exists (usually created by Keycloak sync)
-- If not, this will be created via startup bean
INSERT INTO leagues (id, name, description, league_type, host_id, start_date, end_date, max_participants, is_permanent, created_at, updated_at) VALUES
(nextval('leagues_seq'), 'EcoTrace Global 2026', 'The official global leaderboard for all EcoTrace users. Compete with everyone to become the most eco-friendly user!', 'PUBLIC', 1, '2026-01-01', null, 500, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);