#!/usr/bin/env python3

import os
import sys

import django

#small change to allow repush

def main() -> int:
    if len(sys.argv) != 2:
        print('Usage: python makeadmin.py <username>')
        return 1

    username = sys.argv[1].strip()
    if not username:
        print('Username cannot be empty.')
        return 1

    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'rental_core.settings')
    django.setup()

    from django.contrib.auth import get_user_model

    User = get_user_model()

    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        print(f'User not found: {username}')
        return 1

    user.is_staff = True
    user.is_active = True
    user.save(update_fields=['is_staff', 'is_active'])

    print(f'{username} is now a staff member.')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())