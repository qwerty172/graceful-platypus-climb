import { MadeWithDyad } from "@/components/made-with-dyad";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100">Добро пожаловать в ваше приложение</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          Начните создавать свой удивительный проект здесь!
        </p>
        <Link to="/converter">
          <Button className="px-8 py-4 text-lg">Перейти к конвертеру Python в EXE</Button>
        </Link>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Index;