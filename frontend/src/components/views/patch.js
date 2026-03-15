const fs = require('fs');
const file = '/home/user/Documents/monad/upwork/frontend/src/components/views/DashboardView.tsx';
let content = fs.readFileSync(file, 'utf8');

const replacement = `  const handleCreateAuction = () => {
    if (!contractParams.ready) return;

    // Convert repTier to uint8 enum mapping (0=BRONZE, 1=SILVER, 2=GOLD)
    let repEnumObj = 0;
    if (contractParams.repTier === "SILVER") repEnumObj = 1;
    if (contractParams.repTier === "GOLD") repEnumObj = 2;

    const budgetWei = parseUnits(contractParams.budget.toString(), 18);

    // @ts-ignore
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "createAuction",
      args: [
        contractParams.title,
        \`Requisitos definidos pelo Oracle.\\nPrazo: \${contractParams.deadlineDays} dias.\`,
        budgetWei,
        repEnumObj
      ]
    });
  };

  // UI Helpers
  const maxBudgetDisplay = contractParams.budget > 0 ? contractParams.budget.toLocaleString() : "---";`;

content = content.replace(/const handleCreateAuction = \(\) => \{\n    if \(\!contractParams\.ready\) return;\n\n    \/\/ Convert repTier to uint8 enum mapping \(0=BRONZE, 1=SILVER, 2=GOLD\)\n    let repEnumObj = 0;\n    if \(contractParams\.repTier === "SILVER"\) repEnumObj = 1;\n    if \(contractParams\.repTier === "GOLD"\) repEnumObj = 2;\n\n    const budgetWei = parseUnits\(contractParams\.budget\.toString\(\), 18\);\n\n\n  const deadlineDisplay/g, replacement + "\n  const deadlineDisplay");

fs.writeFileSync(file, content);
