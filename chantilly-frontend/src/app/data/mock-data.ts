export const IMAGES = {
  birthday: "https://images.unsplash.com/photo-1741969494307-55394e3e4071?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiaXJ0aGRheSUyMGNha2UlMjBkZWNvcmF0ZWR8ZW58MXx8fHwxNzc2MDMyNzE0fDA&ixlib=rb-4.1.0&q=80&w=1080",
  chocolate: "https://images.unsplash.com/photo-1700448293876-07dca826c161?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaG9jb2xhdGUlMjBjYWtlJTIwc2xpY2V8ZW58MXx8fHwxNzc2MDMyNzE0fDA&ixlib=rb-4.1.0&q=80&w=1080",
  cupcakes: "https://images.unsplash.com/photo-1615557509870-98972c5e1396?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXBjYWtlcyUyMGNvbG9yZnVsJTIwYmFrZXJ5fGVufDF8fHx8MTc3NjAzMjcxNXww&ixlib=rb-4.1.0&q=80&w=1080",
  croissant: "https://images.unsplash.com/photo-1751151856149-5ebf1d21586a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXN0cnklMjBjcm9pc3NhbnQlMjBiYWtlcnl8ZW58MXx8fHwxNzc2MDMyNzE1fDA&ixlib=rb-4.1.0&q=80&w=1080",
  wedding: "https://images.unsplash.com/photo-1584158531321-2a1fefff2e51?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwY2FrZSUyMGVsZWdhbnQlMjB3aGl0ZXxlbnwxfHx8fDE3NzYwMzI3MTZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
  bread: "https://images.unsplash.com/photo-1551239271-aed421a79754?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJ1dmlhbiUyMGJha2VyeSUyMGJyZWFkJTIwYXJ0aXNhbnxlbnwxfHx8fDE3NzYwMzI3MTZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
  cheesecake: "https://images.unsplash.com/photo-1641424795123-9f12d697219d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGVlc2VjYWtlJTIwc3RyYXdiZXJyeSUyMGRlc3NlcnR8ZW58MXx8fHwxNzc2MDMyNzE3fDA&ixlib=rb-4.1.0&q=80&w=1080",
  tresLeches: "https://images.unsplash.com/photo-1738717307189-3469f99286ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmVzJTIwbGVjaGVzJTIwY2FrZSUyMHBlcnV2aWFufGVufDF8fHx8MTc3NjAzMjcxOHww&ixlib=rb-4.1.0&q=80&w=1080",
  donuts: "https://images.unsplash.com/photo-1564396338197-996f35b1efbc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb251dCUyMGdsYXplZCUyMGFzc29ydGVkfGVufDF8fHx8MTc3NjAzMjcxOHww&ixlib=rb-4.1.0&q=80&w=1080",
  tart: "https://images.unsplash.com/photo-1588412726439-c4b579e96000?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaWUlMjBmcnVpdCUyMHRhcnQlMjBkZXNzZXJ0fGVufDF8fHx8MTc3NjAzMjcxOHww&ixlib=rb-4.1.0&q=80&w=1080",
  cookies: "https://images.unsplash.com/photo-1610698501974-0f18588d6c2c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb29raWVzJTIwZGVjb3JhdGVkJTIwaG9tZW1hZGV8ZW58MXx8fHwxNzc2MDMyNzE5fDA&ixlib=rb-4.1.0&q=80&w=1080",
};

export type OrderStatus = "Pendiente" | "En preparación" | "Listo" | "En ruta" | "Entregado" | "Cancelado";

export const STATUS_COLORS: Record<OrderStatus, { bg: string; text: string }> = {
  Pendiente: { bg: "#F5C518", text: "#333333" },
  "En preparación": { bg: "#1976D2", text: "#FFFFFF" },
  Listo: { bg: "#4CAF50", text: "#FFFFFF" },
  "En ruta": { bg: "#FF9800", text: "#FFFFFF" },
  Entregado: { bg: "#2E7D32", text: "#FFFFFF" },
  Cancelado: { bg: "#D32F2F", text: "#FFFFFF" },
};

export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
  description: string;
  stock: number;
}

export interface CartItem extends Product {
  quantity: number;
  customization?: string;
}

export interface Order {
  id: string;
  date: string;
  status: OrderStatus;
  items: { name: string; qty: number; price: number }[];
  total: number;
  address: string;
}

export const CATEGORIES = ["Tortas", "Cupcakes", "Pasteles", "Bocaditos", "Panes", "Postres", "Galletas", "Combos"];

export const PRODUCTS: Product[] = [
  { id: 1, name: "Torta de Cumpleaños Clásica", price: 85.0, category: "Tortas", image: IMAGES.birthday, description: "Deliciosa torta decorada con crema chantilly y frutas frescas. Perfecta para celebraciones especiales. Rinde 20 porciones.", stock: 12 },
  { id: 2, name: "Torta de Chocolate Belga", price: 95.0, category: "Tortas", image: IMAGES.chocolate, description: "Torta húmeda de chocolate belga con ganache y trozos de chocolate. Un deleite para los amantes del cacao.", stock: 8 },
  { id: 3, name: "Cupcakes Surtidos x12", price: 48.0, category: "Cupcakes", image: IMAGES.cupcakes, description: "Docena de cupcakes con diferentes sabores: vainilla, chocolate, red velvet y limón. Decorados con buttercream.", stock: 25 },
  { id: 4, name: "Croissants Artesanales x6", price: 28.0, category: "Panes", image: IMAGES.croissant, description: "Media docena de croissants de mantequilla horneados al momento. Crujientes por fuera, suaves por dentro.", stock: 30 },
  { id: 5, name: "Torta de Boda Elegante", price: 350.0, category: "Tortas", image: IMAGES.wedding, description: "Torta de 3 pisos decorada con fondant, flores de azúcar y detalles dorados. Incluye consulta de diseño.", stock: 3 },
  { id: 6, name: "Pan Artesanal de Campo", price: 15.0, category: "Panes", image: IMAGES.bread, description: "Pan rústico de masa madre con corteza crujiente. Ideal para acompañar tus comidas.", stock: 40 },
  { id: 7, name: "Cheesecake de Fresa", price: 72.0, category: "Postres", image: IMAGES.cheesecake, description: "Cheesecake cremoso con base de galleta y cobertura de fresas frescas. Rinde 12 porciones.", stock: 10 },
  { id: 8, name: "Tres Leches Especial", price: 65.0, category: "Postres", image: IMAGES.tresLeches, description: "Clásico tres leches peruano bañado en leche evaporada, condensada y crema. Tradición en cada bocado.", stock: 15 },
  { id: 9, name: "Donuts Glaseados x6", price: 24.0, category: "Bocaditos", image: IMAGES.donuts, description: "Media docena de donuts con glaseado de diferentes sabores: chocolate, fresa, vainilla y caramelo.", stock: 20 },
  { id: 10, name: "Tarta de Frutas", price: 58.0, category: "Pasteles", image: IMAGES.tart, description: "Tarta con crema pastelera y frutas de estación sobre base de masa quebrada artesanal.", stock: 7 },
  { id: 11, name: "Galletas Decoradas x12", price: 36.0, category: "Galletas", image: IMAGES.cookies, description: "Docena de galletas de mantequilla decoradas con glaseado real. Perfectas para regalos y eventos.", stock: 18 },
  { id: 12, name: "Mini Cupcakes x24", price: 55.0, category: "Cupcakes", image: IMAGES.cupcakes, description: "24 mini cupcakes ideales para eventos. Variedad de sabores con decoración personalizable.", stock: 15 },
  { id: 13, name: "Combo Cumpleañero: Torta + Bocaditos", price: 120.0, category: "Combos", image: IMAGES.birthday, description: "La mejor opción para tu fiesta. Incluye una torta clásica de 20 porciones y 50 bocaditos surtidos dulces y salados.", stock: 10 },
  { id: 14, name: "Combo Dulzura: Cheesecake + Cupcakes", price: 95.0, category: "Combos", image: IMAGES.cheesecake, description: "Para compartir con tus personas favoritas. Un cheesecake entero más una docena de cupcakes surtidos.", stock: 8 },
];

export const ORDERS: Order[] = [
  { id: "ORD-2026-001", date: "2026-04-10", status: "Entregado", items: [{ name: "Torta de Cumpleaños Clásica", qty: 1, price: 85 }, { name: "Cupcakes Surtidos x12", qty: 2, price: 48 }], total: 181, address: "Av. Larco 345, Miraflores" },
  { id: "ORD-2026-002", date: "2026-04-11", status: "En ruta", items: [{ name: "Cheesecake de Fresa", qty: 1, price: 72 }], total: 72, address: "Jr. de la Unión 520, Lima Centro" },
  { id: "ORD-2026-003", date: "2026-04-12", status: "Pendiente", items: [{ name: "Torta de Boda Elegante", qty: 1, price: 350 }, { name: "Galletas Decoradas x12", qty: 3, price: 36 }], total: 458, address: "Calle Los Olivos 128, San Isidro" },
  { id: "ORD-2026-004", date: "2026-04-09", status: "En preparación", items: [{ name: "Tres Leches Especial", qty: 2, price: 65 }, { name: "Donuts Glaseados x6", qty: 1, price: 24 }], total: 154, address: "Av. Benavides 1200, Surco" },
  { id: "ORD-2026-005", date: "2026-04-08", status: "Cancelado", items: [{ name: "Pan Artesanal de Campo", qty: 5, price: 15 }], total: 75, address: "Av. Brasil 890, Jesús María" },
  { id: "ORD-2026-006", date: "2026-04-12", status: "Listo", items: [{ name: "Croissants Artesanales x6", qty: 2, price: 28 }, { name: "Tarta de Frutas", qty: 1, price: 58 }], total: 114, address: "Av. Javier Prado 2500, San Borja" },
];

export const SALES_DATA = [
  { date: "07 Abr", ventas: 1250 },
  { date: "08 Abr", ventas: 980 },
  { date: "09 Abr", ventas: 1580 },
  { date: "10 Abr", ventas: 2100 },
  { date: "11 Abr", ventas: 1750 },
  { date: "12 Abr", ventas: 2340 },
];

export const MONTHLY = [
  { month: "Ene", ventas: 18200 },
  { month: "Feb", ventas: 19500 },
  { month: "Mar", ventas: 21100 },
  { month: "Abr", ventas: 22800 },
  { month: "May", ventas: 24750 },
  { month: "Jun", ventas: 26100 },
  { month: "Jul", ventas: 27800 },
  { month: "Ago", ventas: 28950 },
  { month: "Sep", ventas: 30100 },
  { month: "Oct", ventas: 31500 },
  { month: "Nov", ventas: 32900 },
  { month: "Dic", ventas: 34800 },
];
