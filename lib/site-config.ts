export const siteConfig = {
    company: {
        name: "Gentech Car Care",
        legalName: "Gentech Car Care Pvt Ltd",
        copyright: "© 2025 Gentech Car Care™. All Rights Reserved.",
        trademarkNotice: "™ denotes an unregistered trademark. Registration pending."
    },
    contact: {
        phone: {
            display: "+91 99893 67878",
            value: "+919989367878", // For tel: links
        },
        email: "info@gentechguard.com",
        address: {
            line1: "Gentech Headquarters",
            line2: "Hyderabad, Telangana",
            fullAddress: "Hyderabad, Telangana, India",
            mapLink: "https://maps.google.com/?q=Gentech+Guard+Hyderabad"
        },
        whatsapp: {
            number: "919989367878",
            defaultMessage: "Hi, I'm interested in becoming a dealer."
        }
    },
    socials: {
        instagram: "https://instagram.com/gentechguard",
        facebook: "https://facebook.com/gentechguard",
        youtube: "https://youtube.com/@gentechguard"
    },
    navigation: [
        { name: "Home", href: "/home" },
        { name: "Products", href: "/home#product-showcase" },
        { name: "Process", href: "/home#process" },
    ],
    // Fallback products if DB fails or for static generation references
    productCategories: [
        "Gen 4 PPF",
        "Gen 5 PPF",
        "Gen Matte 5",
        "Gen Pro 6+",
        "Gen Pro Ultra 8"
    ],
    metadata: {
        title: "Gentech Car Care | Premium Paint Protection Film",
        description: "Premium Automotive Protection Solutions"
    }
};

export type SiteConfig = typeof siteConfig;
