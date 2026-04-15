# Configuration Centralization And Migration Plan

## 1. Objective
To move all hardcoded, non-sensitive site data (company details, contact info, social links, static product lists) into a single configuration file. This ensures consistency across the application and allows for easy updates from a single source of truth.

## 2. Proposed Solution
Create a new file `lib/site-config.ts` (or `config/site.ts`) that exports a typed configuration object.

### Proposed Schema (`lib/site-config.ts`)

```typescript
export const siteConfig = {
    company: {
        name: "Gentech Guard",
        legalName: "Gentech Guard Pvt Ltd", // Example
        tally: "© 2025 Gentech Guard®. All Rights Reserved."
    },
    contact: {
        phone: {
            display: "+91 99898 20222",
            value: "+919989820222", // For tel: links
        },
        email: "info@gentechguard.com",
        address: {
            line1: "123 Automotive District", // To be updated with real address
            line2: "Hyderabad, Telangana 500033",
            mapLink: "https://maps.google.com/..."
        },
        whatsapp: {
             number: "919989820222",
             defaultMessage: "Hi, I'm interested in becoming a dealer."
        }
    },
    socials: {
        instagram: "https://instagram.com/gentechguard",
        facebook: "https://facebook.com/gentechguard",
        youtube: "https://youtube.com/@gentechguard",
        linkedin: "https://linkedin.com/company/gentechguard"
    },
    // Useful for static dropdowns where DB fetch might be overkill or for initial state
    productCategories: [
        "GEN 4 PPF",
        "GEN 5 PPF",
        "GEN MATTE 5",
        "GEN PRO 6",
        "GEN ULTRA PRO 8"
    ],
    metadata: {
        title: "Gentech Guard | Premium Paint Protection Film",
        description: "Pioneering automotive protection..."
    }
};

export type SiteConfig = typeof siteConfig;
```

## 3. Implementation Steps

### Phase 1: Create Config File
1.  Create `lib/site-config.ts` with the actual data currently found in the codebase.

### Phase 2: Refactor Components
Iterate through the following files and replace hardcoded strings with imports from `siteConfig`.

1.  **`components/Footer.tsx`**:
    *   Replace `+91 99898 20222` -> `siteConfig.contact.phone.display`
    *   Replace `info@gentechguard.com` -> `siteConfig.contact.email`
    *   Replace `Hyderabad, Telangana...` -> `siteConfig.contact.address.line2`
    *   Replace Social Links -> `siteConfig.socials.*`
    *   Replace Copyright Text -> `siteConfig.company.tally`

2.  **`components/WarrantyForm.tsx`**:
    *   Replace `ppfCategories` array -> `siteConfig.productCategories`
    *   Replace Phone placeholder logic if needed (though placeholders are often generic examples like 9876543210).

3.  **`components/Hero.tsx`**:
    *   The `Hero` carousel has specific product titles (`GEN 4 PPF`, etc). These can be pulled from `siteConfig.productCategories` or kept dynamic if they are specific hero assets.
    *   "Become a Dealer" link can utilize `siteConfig.contact.whatsapp` logic.

4.  **`components/ContactForm.tsx` / `components/DealerMap.tsx`**:
    *   Replace any hardcoded contact details shown to the user.

5.  **`components/SolutionsSection.tsx`**:
    *   Currently, this file has a large hardcoded `products` array used for the DB seed.
    *   **Decision**: Since we migrated this to the Database (`products` table), the `SolutionsSection` should ideally be refactored to **fetch** data from Supabase instead of using the hardcoded array.
    *   *Interim*: If we keep it static for SEO/Speed, we can move the array to `siteConfig` or a constant file `lib/constants.ts`.

### Phase 3: Global Search & Cleanup
1.  Run a massive Find & Replace for the specific phone number and email to ensure no instance is missed.
2.  Verify `metadata` in `app/layout.tsx` uses `siteConfig`.

## 4. Benefits
*   **Instant Updates**: Change the phone number in one file, and it updates on the Footer, Contact Page, and WhatsApp links instantly.
*   **Type Safety**: TypeScript ensures you don't typo a property name.
*   **Cleaner Code**: Components focus on UI logic, not data storage.

## 5. Next Actions
*   Approve this plan.
*   I will create the file and begin the refactoring process file-by-file.
