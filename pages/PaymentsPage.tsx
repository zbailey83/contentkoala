import { useAction } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState } from "react";

const prices = [
  {
    priceId: "price_123",
    name: "100 Credits",
    price: 10,
  },
  {
    priceId: "price_456",
    name: "500 Credits",
    price: 45,
  },
  {
    priceId: "price_789",
    name: "1000 Credits",
    price: 80,
  },
];

const PaymentsPage = () => {
  const pay = useAction(api.stripe.pay);
  const [selectedPrice, setSelectedPrice] = useState<string | null>(null);

  const handlePayment = async () => {
    if (!selectedPrice) {
      return;
    }
    const url = await pay({ priceId: selectedPrice });
    window.location.href = url!;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-8">Purchase Credits</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {prices.map((price) => (
          <div
            key={price.priceId}
            className={`p-8 rounded-lg shadow-md cursor-pointer ${
              selectedPrice === price.priceId
                ? "bg-blue-500 text-white"
                : "bg-white"
            }`}
            onClick={() => setSelectedPrice(price.priceId)}
          >
            <h2 className="text-2xl font-bold mb-4">{price.name}</h2>
            <p className="text-4xl font-bold">${price.price}</p>
          </div>
        ))}
      </div>
      <button
        className="mt-8 px-8 py-4 bg-blue-500 text-white rounded-lg shadow-md disabled:opacity-50"
        disabled={!selectedPrice}
        onClick={handlePayment}
      >
        Buy Now
      </button>
    </div>
  );
};

export default PaymentsPage;