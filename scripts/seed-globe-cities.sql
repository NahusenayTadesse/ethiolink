-- The globe's starting cities. Run once on a fresh database, after `npm run db:push`:
--   mysql ethiolink < scripts/seed-globe-cities.sql
-- Staff change them afterwards from /dashboard/globe.
INSERT INTO globe_city (name_en, name_am, name_zh, name_ar, longitude, latitude) VALUES
	('Djibouti', 'ጅቡቲ', '吉布提', 'جيبوتي', 43.15, 11.6),
	('Dubai', 'ዱባይ', '迪拜', 'دبي', 55.3, 25.2),
	('Jeddah', 'ጅዳ', '吉达', 'جدة', 39.2, 21.5),
	('Mumbai', 'ሙምባይ', '孟买', 'مومباي', 72.9, 19.1),
	('Shanghai', 'ሻንጋይ', '上海', 'شنغهاي', 121.5, 31.2),
	('Singapore', 'ሲንጋፖር', '新加坡', 'سنغافورة', 103.8, 1.35),
	('Istanbul', 'ኢስታንቡል', '伊斯坦布尔', 'إسطنبول', 29.0, 41.0),
	('Rotterdam', 'ሮተርዳም', '鹿特丹', 'روتردام', 4.5, 51.9),
	('Lagos', 'ሌጎስ', '拉各斯', 'لاغوس', 3.4, 6.5),
	('Nairobi', 'ናይሮቢ', '内罗毕', 'نيروبي', 36.8, -1.3),
	('Johannesburg', 'ጆሃንስበርግ', '约翰内斯堡', 'جوهانسبرغ', 28.0, -26.2);
