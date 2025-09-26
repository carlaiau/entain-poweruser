import { doServerFetchForTransactionHistory } from "../actions/fetch-transaction-history";
import TransactionForm from "./transactionForm";

const Page = () => {
  return <TransactionForm action={doServerFetchForTransactionHistory} />;
};

export default Page;
