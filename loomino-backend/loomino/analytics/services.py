from django.db.models import Sum, Count

from orders.models import Order
from products.models import Product
from accounts.models import User


def dashboard_statistics():
    return {
        "total_products": Product.objects.count(),
        "total_customers": User.objects.filter(is_staff=False).count(),
        "total_orders": Order.objects.count(),
        "total_revenue": (
            Order.objects.filter(status="delivered")
            .aggregate(total=Sum("total"))
            .get("total") or 0
        ),
    }