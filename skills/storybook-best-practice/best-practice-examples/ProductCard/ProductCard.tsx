import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, Star } from "lucide-react";

export interface ProductCardProps {
  image?: string;
  title?: string;
  price?: number;
  originalPrice?: number;
  rating?: number;
  reviewCount?: number;
  category?: string;
  inStock?: boolean;
  loading?: boolean;
  selected?: boolean;
  onAddToCart?: () => void;
  onToggleSelect?: () => void;
}

export function ProductCard({
  image,
  title,
  price,
  originalPrice,
  rating,
  reviewCount,
  category,
  inStock = true,
  loading = false,
  selected = false,
  onAddToCart,
  onToggleSelect,
}: ProductCardProps) {
  if (loading) {
    return (
      <Card className="w-56 overflow-hidden">
        <Skeleton className="h-40 w-full rounded-none" />
        <CardContent className="pt-3 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
        </CardContent>
        <CardFooter>
          <Skeleton className="h-8 w-full" />
        </CardFooter>
      </Card>
    );
  }

  const discount =
    originalPrice && price && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : null;

  return (
    <Card
      className={`w-56 overflow-hidden cursor-pointer transition-all ${
        selected ? "ring-2 ring-primary" : ""
      } ${!inStock ? "opacity-60" : ""}`}
      onClick={onToggleSelect}
    >
      {/* 图片区域 */}
      <div className="relative h-40 bg-muted overflow-hidden">
        {image ? (
          <img src={image} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
            暂无图片
          </div>
        )}
        {discount && (
          <Badge className="absolute top-2 left-2 bg-red-500 text-white text-xs">
            -{discount}%
          </Badge>
        )}
        {!inStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white text-sm font-medium">已售罄</span>
          </div>
        )}
      </div>

      <CardContent className="pt-3 pb-2 space-y-1">
        {category && (
          <span className="text-xs text-muted-foreground">{category}</span>
        )}
        <p className="text-sm font-medium line-clamp-2 leading-snug">
          {title ?? "—"}
        </p>

        {/* 价格 */}
        <div className="flex items-baseline gap-1.5">
          {price !== undefined ? (
            <span className="text-base font-bold text-red-500">
              ¥{price.toFixed(2)}
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">价格待定</span>
          )}
          {originalPrice && (
            <span className="text-xs text-muted-foreground line-through">
              ¥{originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* 评分 */}
        {rating !== undefined && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span>{rating.toFixed(1)}</span>
            {reviewCount !== undefined && <span>({reviewCount})</span>}
          </div>
        )}
      </CardContent>

      {onAddToCart && (
        <CardFooter className="pt-0">
          <Button
            size="sm"
            className="w-full"
            variant={inStock ? "default" : "outline"}
            disabled={!inStock}
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart();
            }}
          >
            <ShoppingCart className="h-3.5 w-3.5 mr-1" />
            {inStock ? "加入购物车" : "暂时缺货"}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
