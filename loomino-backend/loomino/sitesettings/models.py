from django.core.cache import cache
from django.db import models


class SiteSetting(models.Model):
    """
    Global, site-wide configuration — a singleton (only ever one
    row, pk=1). Editable from Admin > Settings and read by the
    storefront for contact details, social links, the delivery
    charge, currency, the WhatsApp number, and the store map.

    Use `SiteSetting.load()` to always get (and lazily create)
    the single row.
    """

    SINGLETON_ID = 1

    # ---- Core configuration ----
    app_name = models.CharField(max_length=120, blank=True, default="Loomino")
    app_url = models.URLField(blank=True)
    email_address = models.EmailField(
        blank=True,
        help_text="Public business email shown on the storefront.",
    )
    admin_notification_email = models.EmailField(
        blank=True,
        help_text="Where new-order and system notifications are sent.",
    )
    phone_number = models.CharField(
        max_length=30,
        blank=True,
        help_text="Official WhatsApp / contact number.",
    )
    hotline_number = models.CharField(max_length=30, blank=True)

    currency_name = models.CharField(max_length=10, blank=True, default="BDT")
    currency_symbol = models.CharField(max_length=8, blank=True, default="৳")

    delivery_charge = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        help_text="Flat delivery charge applied to every order.",
    )

    # ---- Social & links ----
    facebook_url = models.URLField(blank=True)
    instagram_url = models.URLField(blank=True)
    twitter_url = models.URLField(blank=True)
    youtube_url = models.URLField(blank=True)
    linkedin_url = models.URLField(blank=True)

    privacy_policy_link = models.CharField(max_length=300, blank=True)
    terms_conditions_link = models.CharField(max_length=300, blank=True)

    service_hours = models.CharField(
        max_length=200,
        blank=True,
        help_text="Service hours / footer text.",
    )
    physical_address = models.TextField(blank=True)
    google_map_embed_url = models.TextField(
        blank=True,
        help_text="The src URL from a Google Maps embed iframe.",
    )

    updated_at = models.DateTimeField(auto_now=True)

    _CACHE_KEY = "site_setting_singleton"

    class Meta:
        verbose_name = "Site Setting"
        verbose_name_plural = "Site Settings"

    def __str__(self):
        return "Site Settings"

    def save(self, *args, **kwargs):
        # Force the singleton pk and refresh the cache.
        self.pk = self.SINGLETON_ID
        super().save(*args, **kwargs)
        cache.set(self._CACHE_KEY, self)

    def delete(self, *args, **kwargs):
        # Prevent deletion of the singleton.
        pass

    @classmethod
    def load(cls):
        cached = cache.get(cls._CACHE_KEY)
        if cached is not None:
            return cached
        obj, _ = cls.objects.get_or_create(pk=cls.SINGLETON_ID)
        cache.set(cls._CACHE_KEY, obj)
        return obj
