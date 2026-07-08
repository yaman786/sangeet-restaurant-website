# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e.spec.ts >> Customer Flows >> should navigate to menu and verify structure
- Location: tests/e2e.spec.ts:4:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.waitForSelector: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('main') to be visible

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - banner [ref=e2]:
    - generic [ref=e4]:
      - link "Sangeet Restaurant Home" [ref=e5] [cursor=pointer]:
        - /url: /
        - img "Sangeet Logo" [ref=e6]
      - navigation [ref=e7]:
        - link "Home" [ref=e8] [cursor=pointer]:
          - /url: /
        - link "Menu" [active] [ref=e9] [cursor=pointer]:
          - /url: /menu
          - text: Menu
        - link "Reservations" [ref=e11] [cursor=pointer]:
          - /url: /reservations
        - link "Location" [ref=e12] [cursor=pointer]:
          - /url: /location
        - link "About" [ref=e13] [cursor=pointer]:
          - /url: /about
        - link "Contact" [ref=e14] [cursor=pointer]:
          - /url: /contact
      - generic [ref=e15]:
        - generic [ref=e18]: Open
        - link "Book a Table" [ref=e19] [cursor=pointer]:
          - /url: /reservations
  - generic [ref=e21]:
    - generic [ref=e22]:
      - img "Authentic South Asian cuisine" [ref=e24]
      - generic [ref=e26]:
        - generic [ref=e27]:
          - generic [ref=e28]:
            - img [ref=e29]
            - generic [ref=e31]: Culinary Excellence
          - paragraph [ref=e32]: Experience the finest Indian & Nepali cuisine crafted with passion
        - generic [ref=e33]:
          - generic [ref=e34]:
            - button "Vegetarian" [ref=e35] [cursor=pointer]:
              - img [ref=e36]
              - text: Vegetarian
            - button "Spicy" [ref=e39] [cursor=pointer]:
              - img [ref=e40]
              - text: Spicy
            - button "Chef's Signature" [ref=e42] [cursor=pointer]:
              - img [ref=e43]
              - text: Chef's Signature
          - generic [ref=e46]:
            - button "All Items" [ref=e47] [cursor=pointer]
            - button "Appetizers" [ref=e48] [cursor=pointer]
            - button "Main Course" [ref=e49] [cursor=pointer]
            - button "Biryani" [ref=e50] [cursor=pointer]
            - button "Breads" [ref=e51] [cursor=pointer]
            - button "Desserts" [ref=e52] [cursor=pointer]
    - generic [ref=e54]:
      - generic [ref=e55]:
        - generic [ref=e56]:
          - img "Butter Chicken" [ref=e57]
          - generic [ref=e59]: $18.99
          - generic [ref=e61]:
            - img [ref=e62]
            - text: Signature
        - generic [ref=e64]:
          - heading "Butter Chicken" [level=3] [ref=e65]
          - paragraph [ref=e66]: Creamy tomato-based curry with tender chicken
      - generic [ref=e67]:
        - generic [ref=e68]:
          - img "Paneer Tikka" [ref=e69]
          - generic [ref=e71]: $16.99
          - generic [ref=e72]:
            - generic [ref=e73]:
              - img [ref=e74]
              - text: Veg
            - generic [ref=e77]:
              - img [ref=e78]
              - text: Signature
        - generic [ref=e80]:
          - heading "Paneer Tikka" [level=3] [ref=e81]
          - paragraph [ref=e82]: Grilled cottage cheese with aromatic spices
      - generic [ref=e83]:
        - generic [ref=e84]:
          - img "Biryani" [ref=e85]
          - generic [ref=e87]: $22.99
          - generic [ref=e88]:
            - generic [ref=e89]:
              - img [ref=e90]
              - text: Spicy
            - generic [ref=e92]:
              - img [ref=e93]
              - text: Signature
        - generic [ref=e95]:
          - heading "Biryani" [level=3] [ref=e96]
          - paragraph [ref=e97]: Fragrant rice dish with tender meat and spices
  - contentinfo [ref=e98]:
    - generic [ref=e99]:
      - generic [ref=e100]:
        - generic [ref=e102]:
          - generic [ref=e103]:
            - img "Sangeet Logo" [ref=e107]
            - generic [ref=e108]:
              - heading "Sangeet Restaurant" [level=3] [ref=e109]
              - paragraph [ref=e110]: Authentic South Asian Cuisine
          - paragraph [ref=e111]: Where the soul of South Asia comes alive in the heart of Wanchai. Experience the rich flavors and warm hospitality that make every meal memorable.
          - generic [ref=e112]:
            - link "Facebook" [ref=e113] [cursor=pointer]:
              - /url: "#"
              - img [ref=e114]
            - link "Instagram" [ref=e116] [cursor=pointer]:
              - /url: "#"
              - img [ref=e117]
            - link "Twitter" [ref=e119] [cursor=pointer]:
              - /url: "#"
              - img [ref=e120]
        - generic [ref=e123]:
          - heading "Quick Links" [level=4] [ref=e124]
          - list [ref=e125]:
            - listitem [ref=e126]:
              - link "→ Our Menu" [ref=e127] [cursor=pointer]:
                - /url: /menu
                - generic [ref=e128]: →
                - text: Our Menu
            - listitem [ref=e129]:
              - link "→ Make Reservation" [ref=e130] [cursor=pointer]:
                - /url: /reservations
                - generic [ref=e131]: →
                - text: Make Reservation
            - listitem [ref=e132]:
              - link "→ About Us" [ref=e133] [cursor=pointer]:
                - /url: /about
                - generic [ref=e134]: →
                - text: About Us
            - listitem [ref=e135]:
              - link "→ Contact" [ref=e136] [cursor=pointer]:
                - /url: /contact
                - generic [ref=e137]: →
                - text: Contact
        - generic [ref=e139]:
          - heading "Contact Info" [level=4] [ref=e140]
          - generic [ref=e141]:
            - generic [ref=e142]:
              - img [ref=e144]
              - generic [ref=e147]:
                - paragraph [ref=e148]: Wanchai, Hong Kong
                - paragraph [ref=e149]: Central District
            - generic [ref=e150]:
              - img [ref=e152]
              - link "+852 2345 6789" [ref=e155] [cursor=pointer]:
                - /url: tel:+85223456789
            - generic [ref=e156]:
              - img [ref=e158]
              - generic [ref=e160]:
                - paragraph [ref=e161]: 6:00 PM - 11:00 PM
                - paragraph [ref=e162]: Daily
      - generic [ref=e164]:
        - paragraph [ref=e165]: © 2026 Sangeet Restaurant. All rights reserved.
        - generic [ref=e166]:
          - link "Privacy Policy" [ref=e167] [cursor=pointer]:
            - /url: /privacy
          - link "Terms of Service" [ref=e168] [cursor=pointer]:
            - /url: /terms
  - alert [ref=e169]: Menu - Sangeet Restaurant
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Customer Flows', () => {
  4  |   test('should navigate to menu and verify structure', async ({ page }) => {
  5  |     // Navigate to the home page
  6  |     await page.goto('/');
  7  |     
  8  |     // Expect the title to contain "Sangeet"
  9  |     await expect(page).toHaveTitle(/Sangeet/);
  10 |     
  11 |     // Click on the Menu link in the navigation
  12 |     await page.click('text=Menu');
  13 |     
  14 |     // Verify we are on the menu page
  15 |     await expect(page).toHaveURL(/.*\/menu/);
  16 |     
  17 |     // Verify that the menu categories are visible
> 18 |     await page.waitForSelector('main', { state: 'visible' });
     |                ^ Error: page.waitForSelector: Test timeout of 30000ms exceeded.
  19 |   });
  20 | 
  21 |   test('should navigate to reservation page and show form', async ({ page }) => {
  22 |     // Navigate to the home page
  23 |     await page.goto('/');
  24 |     
  25 |     // Click on Reservations link
  26 |     await page.click('text=Reservations');
  27 |     
  28 |     // Verify URL
  29 |     await expect(page).toHaveURL(/.*\/reservations/);
  30 |     
  31 |     // Verify the reservation form is rendered
  32 |     await expect(page.locator('form')).toBeVisible();
  33 |     
  34 |     // Verify key form inputs are present
  35 |     await expect(page.locator('input[name="customer_name"]')).toBeVisible();
  36 |     await expect(page.locator('input[name="email"]')).toBeVisible();
  37 |     await expect(page.locator('input[name="date"]')).toBeVisible();
  38 |     await expect(page.locator('select[name="time"]')).toBeVisible();
  39 |   });
  40 | });
  41 | 
```