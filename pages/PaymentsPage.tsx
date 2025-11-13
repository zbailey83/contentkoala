import { useAction } from "convex/react";
import { api } from "../convex/_generated/api";
import Button from "../components/Button";

const creditPrices = [
  { priceId: "price_1P6kmfRx5h25aW2pZ3S3gV7k", credits: 100, price: 10 },
  { priceId: "price_1P6kqYRx5h25aW2pEa5k0v9j", credits: 500, price: 45 },
  { priceId: "price_1P6krCRx5h25aW2pide3sP6j", credits: 1000, price: 80 },
];

const PaymentsPage = () => {
  const pay = useAction(api.stripe.pay);

  const handlePayment = async (priceId: string) => {
    const url = await pay({ priceId });
    window.location.href = url!;
  };

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-4xl font-bold mb-8">Buy Credits</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {creditPrices.map((item) => (
          <div
            key={item.priceId}
            className="bg-white rounded-lg shadow-md p-8 flex flex-col items-center"
          >
            <h2 className="text-2xl font-bold mb-4">{item.credits} Credits</h2>
            <p className="text-4xl font-bold mb-4">${item.price}</p>
            <Button onClick={() => handlePayment(item.priceId)}>
              Buy Now
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentsPage;
