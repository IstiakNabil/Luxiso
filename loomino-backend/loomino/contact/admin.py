from django.contrib import admin

from .models import ContactMessage


@admin.register(ContactMessage)
class ContactMessageAdmin(
    admin.ModelAdmin
):

    list_display = (

        "sender_name",

        "sender_email",

        "phone",

        "subject",

        "created_at",

    )

    search_fields = (

        "sender_name",

        "sender_email",

        "phone",

        "subject",

        "message",

    )

    ordering = (

        "-created_at",

    )

    readonly_fields = (

        "created_at",

    )
