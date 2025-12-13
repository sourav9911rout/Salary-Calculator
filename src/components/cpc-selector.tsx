
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface CpcSelectorProps {
  onSelect: (version: number) => void;
}

export function CpcSelector({ onSelect }: CpcSelectorProps) {
  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-[425px]" hideCloseButton>
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">Select Calculator</DialogTitle>
          <DialogDescription className="text-center">
            Choose which Pay Commission Calculator you want to use.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Card 
            className="cursor-pointer bg-muted hover:bg-accent/50 transition-colors"
            onClick={() => onSelect(7)}
          >
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-center">7th CPC Calculator</h3>
            </CardContent>
          </Card>
          <Card 
            className="cursor-pointer bg-muted hover:bg-accent/50 transition-colors"
            onClick={() => onSelect(8)}
          >
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-center">8th CPC Calculator</h3>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
