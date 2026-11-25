interface StepperProps {
  steps: string[];
  currentStep: number;
}

const Stepper = ({ steps, currentStep }: StepperProps) => {
  return (
    <ol className="flex items-center justify-center w-full p-4 space-x-4 text-sm font-medium  rounded-xl border bg-card text-card-foreground shadow sm:text-base rtl:space-x-reverse">
      {steps.map((step, index) => (
        <li
          key={index}
          className={`flex items-center transition-colors ${
            currentStep === index
              ? "text-primary"
              : "text-muted dark:text-muted-foreground"
          }`}
        >
          <span
            className={`flex items-center justify-center w-8 h-8 me-2 text-sm font-semibold border rounded-full transition-colors ${
              currentStep === index
                ? "border-primary bg-primary text-primary-foreground"
                : "border-muted text-muted-foreground"
            }`}
            aria-current={currentStep === index ? "step" : undefined}
          >
            {index + 1}
          </span>
          <span className="hidden sm:inline">{step}</span>
          {index < steps.length - 1 && (
            <svg
              className="w-4 h-4 ms-2 sm:ms-4 rtl:rotate-180 text-muted"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 12 10"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="m7 9 4-4-4-4M1 9l4-4-4-4"
              />
            </svg>
          )}
        </li>
      ))}
    </ol>
  );
};

export default Stepper;
