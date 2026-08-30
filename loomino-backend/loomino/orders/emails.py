"""
Order lifecycle emails — confirmation on checkout, delivered
notice when an admin marks the order as delivered.

Follows the same plain send_mail() pattern already used for
the OTP verification email in api/accounts/serializers.py,
rather than introducing a new HTML-templating system.
"""
from django.core.mail import send_mail


def format_currency(amount):
    return f"৳{amount:.2f}"


def _format_address(address):
    lines = [
        address.full_name,
        address.address_line,
        f"{address.district}, {address.division} {address.postal_code}",
        address.country,
        address.phone_number,
    ]
    return "\n".join(line for line in lines if line)


def _format_items(order):
    lines = []
    for item in order.items.all():
        lines.append(
            f"  - {item.product_name} "
            f"({item.color} / {item.size}) "
            f"x{item.quantity} — {format_currency(item.subtotal)}"
        )
    return "\n".join(lines)


def send_order_confirmation_email(order):
    """Sent right after a successful checkout."""

    payment_method = (
        order.payment.get_payment_method_display()
        if hasattr(order, "payment")
        else "N/A"
    )

    message = (
        f"Hi {order.user.first_name},\n\n"
        f"Thanks for shopping with Loomino! Your order has "
        f"been placed successfully.\n\n"
        f"Order Number: {order.order_number}\n"
        f"Placed On: {order.created_at.strftime('%B %d, %Y')}\n"
        f"Payment Method: {payment_method}\n\n"
        f"Items:\n"
        f"{_format_items(order)}\n\n"
        f"Subtotal: {format_currency(order.subtotal)}\n"
        f"Shipping: {format_currency(order.shipping_cost)}\n"
        f"Discount: -{format_currency(order.discount)}\n"
        f"Total: {format_currency(order.total)}\n\n"
        f"Shipping Address:\n"
        f"{_format_address(order.shipping_address)}\n\n"
        f"You can track this order any time from your account "
        f"under Orders.\n\n"
        f"Thank you for choosing Loomino.\n"
    )

    send_mail(
        subject=f"Loomino Order Confirmation — {order.order_number}",
        message=message,
        from_email=None,
        recipient_list=[order.user.email],
    )

    # Also notify the store's admin notification address, if set
    # in Site Settings, so the owner hears about every new order.
    from sitesettings.models import SiteSetting

    admin_email = SiteSetting.load().admin_notification_email
    if admin_email:
        admin_message = (
            f"New order placed.\n\n"
            f"Order Number: {order.order_number}\n"
            f"Customer: {order.user.first_name} "
            f"{order.user.last_name} ({order.user.email})\n"
            f"Placed On: "
            f"{order.created_at.strftime('%B %d, %Y')}\n\n"
            f"Items:\n{_format_items(order)}\n\n"
            f"Total: {format_currency(order.total)}\n\n"
            f"Shipping Address:\n"
            f"{_format_address(order.shipping_address)}\n"
        )
        send_mail(
            subject=(
                f"New Order — {order.order_number}"
            ),
            message=admin_message,
            from_email=None,
            recipient_list=[admin_email],
            fail_silently=True,
        )


def send_order_delivered_email(order):
    """Sent when an admin marks the order as Delivered."""

    message = (
        f"Hi {order.user.first_name},\n\n"
        f"Your Loomino order has been delivered!\n\n"
        f"Order Number: {order.order_number}\n\n"
        f"Items:\n"
        f"{_format_items(order)}\n\n"
        f"Total: {format_currency(order.total)}\n\n"
        f"We hope you love it. If anything isn't right, reply "
        f"to this email or reach out through our Contact Us "
        f"page and we'll sort it out.\n\n"
        f"Thank you for choosing Loomino.\n"
    )

    send_mail(
        subject=f"Your Loomino Order Has Been Delivered — {order.order_number}",
        message=message,
        from_email=None,
        recipient_list=[order.user.email],
    )
