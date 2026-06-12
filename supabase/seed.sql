-- ═══════════════════════════════════════════════════
-- Keel Mock Data — run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════

-- 1. Shop
INSERT INTO shops (id, name, slug, business_category, created_at)
VALUES ('00000000-0000-0000-0000-000000000001', 'Lewis Shop', 'lewis-shop', 'electronics', now())
ON CONFLICT (id) DO NOTHING;

-- 2. Store settings
INSERT INTO store_settings (shop_id, store_name, store_phone, store_address, currency_symbol, low_stock_threshold, default_payment, receipt_footer, theme, website_url, whatsapp, business_hours)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Lewis Shop',
  '+254 700 123 456',
  'Thika, Kenya',
  'KSh',
  6,
  'M-Pesa',
  'Thank you for shopping with Lewis Shop!',
  'dark',
  'https://lewis-shop.vercel.app',
  '254700123456',
  '{"mon":"8:00-18:00","tue":"8:00-18:00","wed":"8:00-18:00","thu":"8:00-18:00","fri":"8:00-18:00","sat":"9:00-15:00","sun":"closed"}'
)
ON CONFLICT (shop_id) DO NOTHING;

-- 3. Products
INSERT INTO products (shop_id, name, category, price, stock, variants) VALUES
  ('00000000-0000-0000-0000-000000000001', 'iPhone 15 Pro Max Case',         'Cases',             1800, 12, '{"colors":["Black","Blue","Clear"]}'),
  ('00000000-0000-0000-0000-000000000001', 'Samsung Galaxy S24 Ultra Case',   'Cases',             1500,  8, '{"colors":["Black","Green","Purple"]}'),
  ('00000000-0000-0000-0000-000000000001', 'Tempered Glass Screen Protector', 'Screen Protection',  350, 45, '{"storage":["iPhone 15","iPhone 15 Pro","S24 Ultra"]}'),
  ('00000000-0000-0000-0000-000000000001', 'Bluetooth Wireless Earbuds',      'Audio',             2500, 20, '{"colors":["White","Black"]}'),
  ('00000000-0000-0000-0000-000000000001', 'USB-C Fast Charger 65W',          'Chargers',          2200,  3, '{"colors":["White"]}'),
  ('00000000-0000-0000-0000-000000000001', 'Lightning Cable 2m',              'Cables',             600, 30, '{"colors":["White","Black"]}'),
  ('00000000-0000-0000-0000-000000000001', 'USB-C to USB-C Cable 2m',         'Cables',             700, 25, '{"colors":["White","Black","Blue"]}'),
  ('00000000-0000-0000-0000-000000000001', 'Phone Stand Adjustable',          'Accessories',        900, 15, '{"colors":["Black","Silver"]}'),
  ('00000000-0000-0000-0000-000000000001', 'Smart Watch Band 22mm',           'Wearables',          500, 40, '{"colors":["Black","Brown","Blue","Red"],"storage":["22mm","24mm"]}'),
  ('00000000-0000-0000-0000-000000000001', 'Power Bank 20000mAh',             'Chargers',          3500,  2, '{"colors":["Black","White"]}'),
  ('00000000-0000-0000-0000-000000000001', 'AirPods Pro 2 Case Cover',        'Cases',              400, 18, '{"colors":["Black","Pink","Blue","Green"]}'),
  ('00000000-0000-0000-0000-000000000001', 'HDMI Cable 1.5m',                 'Cables',             450, 22, '{}');

-- 4. Stock movements
INSERT INTO stock_movements (shop_id, product_id, product_name, change, reason)
SELECT '00000000-0000-0000-0000-000000000001', id, name, 20, 'Initial stock' FROM products WHERE name = 'iPhone 15 Pro Max Case';

INSERT INTO stock_movements (shop_id, product_id, product_name, change, reason)
SELECT '00000000-0000-0000-0000-000000000001', id, name, 15, 'Initial stock' FROM products WHERE name = 'Samsung Galaxy S24 Ultra Case';

INSERT INTO stock_movements (shop_id, product_id, product_name, change, reason)
SELECT '00000000-0000-0000-0000-000000000001', id, name, 50, 'Initial stock' FROM products WHERE name = 'Tempered Glass Screen Protector';

INSERT INTO stock_movements (shop_id, product_id, product_name, change, reason)
SELECT '00000000-0000-0000-0000-000000000001', id, name, -3, 'Damaged in transit' FROM products WHERE name = 'USB-C to USB-C Cable 2m';

INSERT INTO stock_movements (shop_id, product_id, product_name, change, reason)
SELECT '00000000-0000-0000-0000-000000000001', id, name, 10, 'Restock from supplier' FROM products WHERE name = 'Power Bank 20000mAh';

INSERT INTO stock_movements (shop_id, product_id, product_name, change, reason)
SELECT '00000000-0000-0000-0000-000000000001', id, name, -1, 'Return — faulty unit' FROM products WHERE name = 'USB-C Fast Charger 65W';

INSERT INTO stock_movements (shop_id, product_id, product_name, change, reason)
SELECT '00000000-0000-0000-0000-000000000001', id, name, 25, 'New shipment arrived' FROM products WHERE name = 'Bluetooth Wireless Earbuds';

-- 5. Sales (60 random transactions over past 60 days)
INSERT INTO sales (shop_id, product_id, product_name, amount, quantity, method, created_at)
SELECT
  '00000000-0000-0000-0000-000000000001',
  p.id,
  p.name,
  p.price * s.qty,
  s.qty,
  s.method,
  now() - (s.days || ' days')::interval - ((random() * 24) || ' hours')::interval
FROM (
  VALUES
    (1, 2, 'Cash'),    (2, 1, 'M-Pesa'),   (3, 1, 'Cash'),    (4, 2, 'M-Pesa'),
    (5, 1, 'Bank'),    (6, 1, 'Cash'),     (7, 3, 'M-Pesa'),  (8, 1, 'Cash'),
    (9, 2, 'IntaSend'),(10, 1, 'M-Pesa'),  (11, 1, 'Cash'),   (12, 2, 'Bank'),
    (1, 1, 'M-Pesa'),  (3, 2, 'Cash'),     (5, 1, 'M-Pesa'),  (7, 1, 'Cash'),
    (9, 1, 'Bank'),    (2, 2, 'IntaSend'), (4, 1, 'M-Pesa'),  (6, 2, 'Cash'),
    (8, 1, 'M-Pesa'),  (10, 1, 'Cash'),    (12, 1, 'M-Pesa'), (1, 3, 'Bank'),
    (3, 1, 'Cash'),    (5, 2, 'M-Pesa'),   (7, 1, 'IntaSend'),(9, 2, 'Cash'),
    (11, 1, 'M-Pesa'), (2, 1, 'Bank'),     (4, 1, 'Cash'),    (6, 1, 'M-Pesa'),
    (8, 2, 'Cash'),    (10, 1, 'Bank'),    (1, 2, 'M-Pesa'),  (3, 1, 'IntaSend'),
    (5, 1, 'Cash'),    (7, 2, 'M-Pesa'),   (9, 1, 'Cash'),    (11, 2, 'Bank'),
    (2, 2, 'M-Pesa'),  (4, 1, 'IntaSend'), (6, 1, 'Cash'),    (8, 1, 'M-Pesa'),
    (10, 2, 'Bank'),   (12, 1, 'Cash'),    (1, 1, 'M-Pesa'),  (3, 3, 'Cash'),
    (5, 1, 'Bank'),    (7, 1, 'M-Pesa'),   (9, 2, 'Cash'),    (11, 1, 'M-Pesa'),
    (2, 1, 'Cash'),    (4, 2, 'Bank'),     (6, 1, 'M-Pesa'),  (8, 1, 'IntaSend'),
    (10, 1, 'Cash'),   (12, 2, 'M-Pesa'),  (1, 2, 'Bank'),    (3, 1, 'M-Pesa')
) AS s(product_num, qty, method)
JOIN (
  SELECT id, name, price, ROW_NUMBER() OVER (ORDER BY id) AS rn FROM products
) p ON p.rn = s.product_num;

-- 6. Catalogue (website listings)
INSERT INTO catalogue (shop_id, name, type, category, price, image, available, featured, variants, specs, includes) VALUES
  ('00000000-0000-0000-0000-000000000001', 'iPhone 15 Pro Max Case',       'product', 'Cases',     1800, 'https://picsum.photos/seed/case1/400/400', true, true,  '{"colors":["Black","Blue","Clear"]}',             ARRAY['Premium silicone','Shockproof','Wireless charging compatible'],              ARRAY['1x Case']),
  ('00000000-0000-0000-0000-000000000001', 'Samsung Galaxy S24 Ultra Case','product', 'Cases',     1500, 'https://picsum.photos/seed/case2/400/400', true, true,  '{"colors":["Black","Green","Purple"]}',           ARRAY['Military-grade drop protection','Soft-touch finish'],                        ARRAY['1x Case']),
  ('00000000-0000-0000-0000-000000000001', 'Bluetooth Wireless Earbuds',   'product', 'Audio',     2500, 'https://picsum.photos/seed/buds/400/400',   true, false, '{"colors":["White","Black"]}',                   ARRAY['Bluetooth 5.3','24hr battery','IPX5 waterproof'],                           ARRAY['Earbuds','Charging case','3x ear tips']),
  ('00000000-0000-0000-0000-000000000001', 'USB-C Fast Charger 65W',       'product', 'Chargers',  2200, 'https://picsum.photos/seed/charger/400/400', true, false, '{}',                                              ARRAY['GaN technology','65W PD 3.0','Foldable plug'],                             ARRAY['Charger','USB-C cable']),
  ('00000000-0000-0000-0000-000000000001', 'Power Bank 20000mAh',           'product', 'Chargers',  3500, 'https://picsum.photos/seed/powerbank/400/400',true, false, '{"colors":["Black","White"]}',                   ARRAY['20000mAh','PD 45W','LED display'],                                         ARRAY['Power bank','USB-C cable']),
  ('00000000-0000-0000-0000-000000000001', 'Smart Watch Band 22mm',         'product', 'Wearables',  500, 'https://picsum.photos/seed/band/400/400',   true, false, '{"colors":["Black","Brown","Blue","Red"]}',      ARRAY['Silicone','Quick-release pins','Adjustable'],                              ARRAY['1x band']),
  ('00000000-0000-0000-0000-000000000001', 'AirPods Pro 2 Case Cover',      'product', 'Cases',      400, 'https://picsum.photos/seed/airpodcase/400/400',true,false, '{"colors":["Black","Pink","Blue","Green"]}',      ARRAY['Silicone gel','Shock-absorbent','Includes carabiner'],                     ARRAY['1x cover']);

-- 7. Banners
INSERT INTO banners (shop_id, type, title, subtitle, message, image_url, active, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000001', 'hero',  'New Arrivals',     'Check out the latest cases and chargers', NULL, 'https://picsum.photos/seed/banner1/1200/400', true, 1),
  ('00000000-0000-0000-0000-000000000001', 'sale',  '40% Off Screen Protectors', NULL, 'Limited time offer — stock running out!', 'https://picsum.photos/seed/banner2/1200/400', true, 2),
  ('00000000-0000-0000-0000-000000000001', 'info',  'Free Delivery',     NULL, 'Free delivery on orders over KSh 3,000 within Thika', NULL, true, 3),
  ('00000000-0000-0000-0000-000000000001', 'alert', 'Holiday Hours',     NULL, 'We''re open 9am-3pm on Saturdays. Closed Sundays.', NULL, true, 4);

-- 8. Posts (social media)
INSERT INTO posts (shop_id, platform, caption, status, scheduled_at, likes, comments, reach, created_at) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Instagram', 'New iPhone 15 cases have arrived! Grab yours today 🔥 #iPhone15 #Cases',                                                                             'published', NULL, 47, 12, 2340, now() - interval '2 days'),
  ('00000000-0000-0000-0000-000000000001', 'Instagram', 'USB-C fast chargers now in stock — 65W GaN technology ⚡',                                                                                            'published', NULL, 31,  8, 1890, now() - interval '5 days'),
  ('00000000-0000-0000-0000-000000000001', 'Instagram', 'Customer review: ''Best earbuds I''ve ever used!'' 🎧',                                                                                                'published', NULL, 23,  5, 1560, now() - interval '10 days'),
  ('00000000-0000-0000-0000-000000000001', 'Instagram', 'Flash sale this weekend — 20% off all accessories!',                                                                                                   'scheduled', now() + interval '3 days', NULL, NULL, NULL, now()),
  ('00000000-0000-0000-0000-000000000001', 'TikTok',    'Unboxing the new Samsung S24 Ultra case — link in bio!',                                                                                              'published', NULL, 89, 21, 5600, now() - interval '7 days'),
  ('00000000-0000-0000-0000-000000000001', 'Instagram', 'We''ve restocked the 20000mAh power banks. Stay charged! 🔋',                                                                                          'published', NULL, 15,  3,  890, now() - interval '14 days');

-- 9. Page views (200 analytics entries)
INSERT INTO page_views (shop_id, page, product_name, referrer, user_agent, created_at)
SELECT
  '00000000-0000-0000-0000-000000000001',
  '/product/' || lower(regexp_replace(c.name, '\s+', '-', 'g')),
  c.name,
  (ARRAY['google','instagram','facebook','direct','twitter','whatsapp'])[floor(random() * 6 + 1)],
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  now() - (floor(random() * 60) || ' days')::interval - (random() * 24 || ' hours')::interval
FROM (
  SELECT name FROM catalogue ORDER BY id
) c
CROSS JOIN generate_series(1, 25);
