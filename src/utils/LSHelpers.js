
export const LS = {
    get(key) { return JSON.parse(localStorage.getItem(key) || '[]'); },
    set(key, val) { localStorage.setItem(key, JSON.stringify(val)); },
};

export const seedData = {
    ri_users: [
        { id: "admin", name: "Admin", role: "admin", password: "admin123" },
        { id: "user", name: "Mr Customer", role: "customer", password: "user123" }
    ],
    ri_products: [],
    ri_schemes: [
        { scheme_id: "S01", name: "Festive 10%", discountPercent: 10, validFrom: "2025-12-01", validTo: "2026-01-10", product_ids: ["P001", "P002", "P003", "P004", "P005"] }
    ],
    ri_orders: [
        {
            order_id: "O1001",
            customer_id: "user",
            product_id: "P001",
            quantity: 2,
            amount: 240,
            address: "123, Example Street",
            paymentType: "COD",
            scheme_id: "S01",
            status: "PENDING",
            createdAt: "2025-12-09T11:00:00Z",
            history: [
                { status: "PENDING", at: "2025-12-09T11:00:00Z", by: "user" }
            ],
            dispatchInfo: null,
            deliveryInfo: null
        }
    ],
    ri_complaints: [
        {
            complaint_id: "C5001",
            customer_id: "user",
            product_id: "P001",
            description: "Leaking bottle",
            images: [],
            status: "PENDING",
            createdAt: "2025-12-08T10:00:00Z",
            history: [{ status: "PENDING", at: "2025-12-08T10:00:00Z" }]
        }
    ],
    ri_targets: [
        { month: new Date().toISOString().slice(0, 7), user_id: "user", target: 50000, achieved: 1200 }
    ]
};

// Generate Products: 20 stationery categories x 10 items each, with random seeded images
const CATEGORY_DATA = [
    { category: 'Writing Instruments', items: ['Ball Pen', 'Gel Pen', 'Roller Pen', 'Fountain Pen', 'Marker Pen', 'Permanent Marker', 'Sketch Pen', 'Highlighter', 'Mechanical Pencil', 'Refill'] },
    { category: 'Pencils & Erasers', items: ['HB Pencil', '2B Pencil', '4B Pencil', 'Drawing Pencil', 'Color Pencil', 'Eraser', 'Dust-Free Eraser', 'Pencil Cap', 'Pencil Extender', 'Sharpener'] },
    { category: 'Notebooks & Registers', items: ['Single Line Notebook', 'Four Line Notebook', 'Plain Notebook', 'Square Notebook', 'Spiral Notebook', 'Long Notebook', 'Practical Notebook', 'Drawing Book', 'Rough Copy', 'Register'] },
    { category: 'Paper Products', items: ['A4 Paper', 'A3 Paper', 'Legal Paper', 'Letter Paper', 'Colored Paper', 'Glossy Paper', 'Photo Paper', 'Craft Paper', 'Butter Paper', 'Carbon Paper'] },
    { category: 'School Supplies', items: ['School Diary', 'Homework Notebook', 'Exam Pad', 'Geometry Box', 'Lunch Label', 'Name Sticker', 'Book Cover', 'School ID Holder', 'Timetable', 'Assignment Folder'] },
    { category: 'Office Supplies', items: ['File Folder', 'Document Folder', 'Clipboard', 'Paper Tray', 'Desk Organizer', 'Sticky Notes', 'Binder Clips', 'Paper Clips', 'Push Pins', 'Index Dividers'] },
    { category: 'Files & Folders', items: ['Box File', 'Lever Arch File', 'Ring Binder', 'Display File', 'L-File', 'Button Folder', 'Expanding File', 'Conference File', 'Report File', 'Plastic Folder'] },
    { category: 'Art & Drawing', items: ['Drawing Sheet', 'Canvas Board', 'Poster Color', 'Water Color', 'Acrylic Color', 'Oil Pastel', 'Crayon', 'Drawing Pencil Set', 'Paint Brush', 'Palette'] },
    { category: 'Craft Materials', items: ['Craft Paper Pack', 'Origami Paper', 'Foam Sheet', 'Glitter Sheet', 'Felt Sheet', 'Ice Cream Sticks', 'Pipe Cleaner', 'Googly Eyes', 'Craft Glue', 'Decorative Tape'] },
    { category: 'Adhesives & Tapes', items: ['Fevicol', 'Glue Stick', 'Super Glue', 'Double-Sided Tape', 'Transparent Tape', 'Masking Tape', 'Brown Tape', 'Foam Tape', 'Paper Tape', 'Glue Gun Stick'] },
    { category: 'School Bags & Accessories', items: ['School Bag', 'Pencil Pouch', 'Geometry Box Set', 'Water Bottle', 'Lunch Box', 'School Belt', 'ID Card Holder', 'Book Cover Set', 'Name Tag', 'Bag Tag'] },
    { category: 'Calculators & Math Tools', items: ['Basic Calculator', 'Scientific Calculator', 'Ruler', 'Scale', 'Protractor', 'Compass', 'Divider', 'Set Square', 'Measuring Tape', 'Mathematical Set'] },
    { category: 'Printing & Photocopy Supplies', items: ['Printer Paper', 'Ink Cartridge', 'Toner', 'Photocopy Paper', 'Binding Cover', 'Spiral Coil', 'Lamination Pouch', 'Photo Paper Glossy', 'Label Sheet', 'Printer Ribbon'] },
    { category: 'Desk Accessories', items: ['Stapler', 'Staple Pins', 'Staple Remover', 'Scissors', 'Cutter', 'Cutting Mat', 'Paper Punch', 'Desk Organizer Set', 'Pen Stand', 'Letter Opener'] },
    { category: 'Markers & Presentation', items: ['Whiteboard Marker', 'Permanent Marker Set', 'CD Marker', 'Flipchart Marker', 'OHP Marker', 'Chalk Marker', 'Board Eraser', 'Whiteboard', 'Presentation Cards', 'Chart Paper Pack'] },
    { category: 'Diaries & Planners', items: ['Daily Diary', 'Executive Diary', 'Pocket Diary', 'Weekly Planner', 'Monthly Planner', 'Annual Planner', 'To-Do Planner', 'Meeting Diary', 'Budget Diary', 'Address Book'] },
    { category: 'Greeting & Gift Stationery', items: ['Greeting Card', 'Birthday Card', 'Wedding Card', 'Thank You Card', 'Gift Wrap Paper', 'Gift Bag', 'Gift Box', 'Ribbon', 'Gift Tag', 'Envelope Set'] },
    { category: 'Envelopes & Packaging', items: ['Plain Envelope', 'A4 Envelope', 'Courier Envelope', 'Bubble Envelope', 'Brown Envelope', 'Document Envelope', 'Packing Tape', 'Packing Paper', 'Labels', 'Shipping Sticker'] },
    { category: 'School Art & Project Material', items: ['Chart Paper', 'Project File', 'Mount Board', 'Thermocol Sheet', 'Colored Sheet', 'Glitter Paper', 'Sketch Pens Set', 'Decorative Stickers', 'Project Borders', 'Project Labels'] },
    { category: 'Educational & Study Material', items: ['Dictionary', 'General Knowledge Book', 'Drawing Book Set', 'Practice Book', 'Exam Guide', 'Question Bank', 'Flash Cards', 'Educational Charts', 'Maps', 'Educational Stickers'] },
];

// Specific curated showcase products with variants (matching user references)
const FEATURED_PRODUCTS = [
    {
        product_id: 'P001',
        name: 'Luxor 1852 Highlighter',
        price: 22,
        mrp: 25,
        category: 'Writing Instruments',
        image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=500&auto=format&fit=crop&q=60',
        images: [
            'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=500&auto=format&fit=crop&q=60',
            'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=500&auto=format&fit=crop&q=60',
            'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=500&auto=format&fit=crop&q=60'
        ],
        hasVariants: true,
        variants: [
            { variant_id: 'v1', name: 'Yellow', price: 22, mrp: 25, inStock: true },
            { variant_id: 'v2', name: 'Green', price: 22, mrp: 25, inStock: true },
            { variant_id: 'v3', name: 'Pink', price: 22, mrp: 25, inStock: true },
            { variant_id: 'v4', name: 'Orange', price: 22, mrp: 25, inStock: true }
        ],
        launchDate: new Date().toISOString().split('T')[0],
        description: 'Vibrant fluorescent highlighters with chisel tip for smooth underlining.'
    },
    {
        product_id: 'P002',
        name: 'Unomax Highlighter - Yellow',
        price: 22,
        mrp: 25,
        category: 'Writing Instruments',
        image: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=500&auto=format&fit=crop&q=60',
        images: [
            'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=500&auto=format&fit=crop&q=60',
            'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=500&auto=format&fit=crop&q=60'
        ],
        hasVariants: false,
        variants: [],
        launchDate: new Date().toISOString().split('T')[0],
        description: 'Bright neon yellow ink with ultra-long cap-off time.'
    },
    {
        product_id: 'P003',
        name: 'Camlin Brush Pen - 14 Shades',
        price: 203,
        mrp: 225,
        category: 'Art & Drawing',
        image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=500&auto=format&fit=crop&q=60',
        images: [
            'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=500&auto=format&fit=crop&q=60',
            'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=500&auto=format&fit=crop&q=60',
            'https://images.unsplash.com/photo-1580493113155-75e1176b6a03?w=500&auto=format&fit=crop&q=60'
        ],
        hasVariants: true,
        variants: [
            { variant_id: 'v11', name: '14 Shades Pack', price: 203, mrp: 225, inStock: true },
            { variant_id: 'v12', name: '24 Shades Pack', price: 340, mrp: 380, inStock: true }
        ],
        launchDate: new Date().toISOString().split('T')[0],
        description: 'Flexible brush tip pens for expressive strokes, calligraphy and blending.'
    }
];

seedData.ri_products.push(...FEATURED_PRODUCTS);

let productCounter = 4;
CATEGORY_DATA.forEach(({ category, items }) => {
    items.forEach((name) => {
        const id = `P${String(productCounter).padStart(3, '0')}`;
        const hasVar = productCounter % 7 === 0;
        const basePrice = (Math.floor(Math.random() * 40) + 5) * 10;
        const mrp = Math.round(basePrice * 1.15);
        const mainImg = `https://picsum.photos/seed/${id}/400/400`;
        const hasMultiple = productCounter % 3 === 0;

        seedData.ri_products.push({
            product_id: id,
            name,
            price: basePrice,
            mrp,
            category,
            image: mainImg,
            images: hasMultiple ? [
                mainImg,
                `https://picsum.photos/seed/${id}_side/400/400`,
                `https://picsum.photos/seed/${id}_detail/400/400`
            ] : [mainImg],
            hasVariants: hasVar,
            variants: hasVar ? [
                { variant_id: `${id}_v1`, name: 'Blue', price: basePrice, mrp, inStock: true },
                { variant_id: `${id}_v2`, name: 'Black', price: basePrice, mrp, inStock: true },
                { variant_id: `${id}_v3`, name: 'Red', price: basePrice, mrp, inStock: true }
            ] : [],
            launchDate: productCounter % 9 === 0
                ? new Date(Date.now() - Math.floor(Math.random() * 20) * 86400000).toISOString().split('T')[0]
                : '2025-01-01'
        });
        productCounter++;
    });
});

const SEED_VERSION = 'stationery-v3';

export function seedLocalStorage() {
    const products = localStorage.getItem('ri_products');
    const version = localStorage.getItem('ri_seed_version');
    // Force reset if old data exists, version is stale, or storage is empty
    if (!products || version !== SEED_VERSION) {
        console.log("Reseeding data...");
        // Ensure month is current in seedData before setting
        seedData.ri_targets[0].month = new Date().toISOString().slice(0, 7);
        Object.keys(seedData).forEach(k => localStorage.setItem(k, JSON.stringify(seedData[k])));
        localStorage.setItem('ri_seed_version', SEED_VERSION);
        window.location.reload();
    }
}

export function notifyDataChange() { window.dispatchEvent(new Event('ri_data_changed')); }

export function addNotification({ userId = 'all', title, message, type = 'info' }) {
    const list = LS.get('ri_notifications');
    list.unshift({
        id: 'N' + Date.now() + Math.floor(Math.random() * 1000),
        userId,
        title,
        message,
        type,
        createdAt: new Date().toISOString(),
        readBy: [],
    });
    LS.set('ri_notifications', list);
    notifyDataChange();
}

export function getNotificationsForUser(userId) {
    return LS.get('ri_notifications')
        .filter(n => n.userId === userId || n.userId === 'all')
        .map(n => ({ ...n, read: (n.readBy || []).includes(userId) }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function markNotificationRead(notificationId, userId) {
    const list = LS.get('ri_notifications');
    const idx = list.findIndex(n => n.id === notificationId);
    if (idx > -1 && !(list[idx].readBy || []).includes(userId)) {
        list[idx].readBy = [...(list[idx].readBy || []), userId];
        LS.set('ri_notifications', list);
        notifyDataChange();
    }
}

export function markAllNotificationsRead(userId) {
    const list = LS.get('ri_notifications');
    let changed = false;
    list.forEach(n => {
        if ((n.userId === userId || n.userId === 'all') && !(n.readBy || []).includes(userId)) {
            n.readBy = [...(n.readBy || []), userId];
            changed = true;
        }
    });
    if (changed) {
        LS.set('ri_notifications', list);
        notifyDataChange();
    }
}

export function getCustomerProfile(userId) {
    const profiles = JSON.parse(localStorage.getItem('ri_customer_profiles') || '{}');
    return profiles[userId] || null;
}

function setCustomerProfile(userId, profile) {
    const profiles = JSON.parse(localStorage.getItem('ri_customer_profiles') || '{}');
    profiles[userId] = profile;
    localStorage.setItem('ri_customer_profiles', JSON.stringify(profiles));
    notifyDataChange();
}

export function saveContactInfo(userId, contact) {
    const profile = getCustomerProfile(userId) || { addresses: [], defaultAddressId: null };
    setCustomerProfile(userId, { ...profile, ...contact });
}

export function addCustomerAddress(userId, address) {
    const profile = getCustomerProfile(userId) || { addresses: [], defaultAddressId: null };
    const addresses = profile.addresses || [];
    const newAddress = { id: 'addr_' + Date.now(), ...address };
    const updatedAddresses = [...addresses, newAddress];
    const defaultAddressId = profile.defaultAddressId || newAddress.id;
    setCustomerProfile(userId, { ...profile, addresses: updatedAddresses, defaultAddressId });
    return newAddress;
}

export function updateCustomerAddress(userId, addressId, updates) {
    const profile = getCustomerProfile(userId);
    if (!profile) return;
    const addresses = (profile.addresses || []).map(a => a.id === addressId ? { ...a, ...updates } : a);
    setCustomerProfile(userId, { ...profile, addresses });
}

export function deleteCustomerAddress(userId, addressId) {
    const profile = getCustomerProfile(userId);
    if (!profile) return;
    const addresses = (profile.addresses || []).filter(a => a.id !== addressId);
    let defaultAddressId = profile.defaultAddressId;
    if (defaultAddressId === addressId) {
        defaultAddressId = addresses[0]?.id || null;
    }
    setCustomerProfile(userId, { ...profile, addresses, defaultAddressId });
}

export function setDefaultAddress(userId, addressId) {
    const profile = getCustomerProfile(userId);
    if (!profile) return;
    setCustomerProfile(userId, { ...profile, defaultAddressId: addressId });
}

export function createOrder(orderObject) {
    const orders = LS.get('ri_orders');
    orders.unshift(orderObject);
    LS.set('ri_orders', orders);

    // Update target achieved
    const targets = LS.get('ri_targets');
    const month = new Date().toISOString().slice(0, 7);
    const targetIdx = targets.findIndex(t => t.user_id === orderObject.customer_id && t.month === month);

    if (targetIdx !== -1) {
        targets[targetIdx].achieved += orderObject.amount;
        LS.set('ri_targets', targets);
    } else {
        // Create new target if missing? Or just ignore. 
        // For this app, let's auto-create a default target if it's a new month.
        targets.push({
            month,
            user_id: orderObject.customer_id,
            target: 50000,
            achieved: orderObject.amount
        });
        LS.set('ri_targets', targets);
    }

    notifyDataChange();
}

export function updateOrderStatus(order_id, newStatus, meta = {}) {
    const orders = LS.get('ri_orders');
    const idx = orders.findIndex(o => o.order_id === order_id);
    if (idx === -1) throw new Error('Order not found');
    orders[idx].status = newStatus;
    orders[idx].history.push({ status: newStatus, at: new Date().toISOString(), ...meta });
    LS.set('ri_orders', orders);
    notifyDataChange();
}

export function createComplaint(c) {
    const arr = LS.get('ri_complaints');
    arr.unshift(c);
    LS.set('ri_complaints', arr);
    notifyDataChange();
}

export function createFeedback(feedback) {
    const arr = LS.get('ri_feedbacks');
    arr.unshift({
        feedback_id: 'F' + Date.now() + Math.floor(Math.random() * 1000),
        createdAt: new Date().toISOString(),
        ...feedback,
    });
    LS.set('ri_feedbacks', arr);
    notifyDataChange();

    addNotification({
        userId: 'admin',
        title: 'New Feedback Received',
        message: `${feedback.name} rated ${feedback.rating}/5 — "${feedback.message.slice(0, 60)}${feedback.message.length > 60 ? '…' : ''}"`,
        type: 'feedback',
    });
}

export function updateComplaintStatus(complaint_id, newStatus, meta = {}) {
    const arr = LS.get('ri_complaints');
    const i = arr.findIndex(x => x.complaint_id === complaint_id);
    if (i === -1) return;
    arr[i].status = newStatus;
    arr[i].history.push({ status: newStatus, at: new Date().toISOString(), ...meta });
    LS.set('ri_complaints', arr);
    notifyDataChange();

    if (newStatus === 'RESOLVED') {
        addNotification({
            userId: arr[i].customer_id,
            title: 'Complaint Resolved',
            message: `Your complaint #${complaint_id} has been resolved.`,
            type: 'complaint',
        });
    }
}

export function createScheme(scheme) {
    const current = LS.get('ri_schemes');
    current.unshift(scheme);
    LS.set('ri_schemes', current);
    notifyDataChange();

    addNotification({
        userId: 'all',
        title: 'New Scheme Live',
        message: `${scheme.name} — get ${scheme.discountPercent}% off. Ends ${scheme.validTo}.`,
        type: 'scheme',
    });
}
