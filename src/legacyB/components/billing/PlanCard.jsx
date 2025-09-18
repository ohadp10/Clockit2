import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Loader2 } from 'lucide-react';

export default function PlanCard({ plan, isCurrent, isPopular, isLoading, onSelect }) {
  const { id, name, price, feature, cta } = plan;

  const handleSelect = () => {
    if (!isCurrent) {
      onSelect(id);
    }
  };

  return (
    <Card className={`
      modern-card flex flex-col transition-all duration-300
      ${isCurrent ? 'border-blue-600 ring-2 ring-blue-600' : 'border-gray-200'}
      ${isPopular && !isCurrent ? 'border-purple-500' : ''}
    `}>
      <CardHeader className="relative">
        {isPopular && (
          <Badge className="absolute top-4 left-4 bg-purple-600 text-white">
            הכי פופולרית
          </Badge>
        )}
        <CardTitle className="text-2xl font-bold text-gray-800">{name}</CardTitle>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-extrabold text-blue-600">₪{price}</span>
          <span className="text-gray-500">/ לחודש</span>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex items-center gap-2 text-gray-700">
          <Check className="w-5 h-5 text-green-500" />
          <span>{feature}</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleSelect}
          disabled={isCurrent || isLoading}
          className="w-full text-lg py-6 modern-button"
        >
          {isLoading && <Loader2 className="w-5 h-5 ml-2 animate-spin" />}
          {isCurrent ? "התוכנית שלך" : cta}
        </Button>
      </CardFooter>
    </Card>
  );
}