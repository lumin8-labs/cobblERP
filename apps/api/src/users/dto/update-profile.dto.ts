export class UpdateProfileDto {
  name?: string;
  image?: string | null;
  jobTitle?: string | null;
  phone?: string | null;
  defaultDepartment?: string | null;
  preferredTheme?: 'g100' | 'white';
  emailNotifications?: boolean;
}

