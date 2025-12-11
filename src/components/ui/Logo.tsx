import budgetWiseLogo from "../../assets/logo.jpg";

export function Logo() {
  return (
    <div className="flex items-center justify-center mb-6">
      <div className="relative w-32 h-32 rounded-2xl bg-[#1a1a1a] flex items-center justify-center">
        <img
          src={budgetWiseLogo}
          alt="BudgetWise logo"
          className="w-35 h-35 object-contain rounded-2xl"
        />
      </div>
    </div>
  );
}
