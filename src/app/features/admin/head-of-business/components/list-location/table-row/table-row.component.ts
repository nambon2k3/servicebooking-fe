import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { Router } from '@angular/router';
import { LocationService } from '../../../services/location/location.service';
import { Locations } from '../../../../../../core/models/location.model';
import { TruncatePipe } from '../../../../../../shared/pipes/truncate.pipe';
@Component({
  selector: '[app-table-row]',
  imports: [FormsModule, AngularSvgIconModule, TruncatePipe],
  templateUrl: './table-row.component.html',
  styleUrl: './table-row.component.css',
})
export class TableRowComponent {
  @Input() location: Locations = <Locations>{};

  constructor(
    private locationService: LocationService,
    private router: Router
  ) { }

  deleteLocation(): void {
    this.locationService.deleteLocation(this.location.id).subscribe({
      next: (response) => {
        if (response.code === 200) {
          this.location.deleted = true;
        }
      },
      error: (err) => {
        console.error('Failed to hide Location:', err);
      },
    });
  }

  openDetail(location: Locations): void {
    this.router.navigate(['/head-business/location-details'], {
      queryParams: { id: location.id }
    });
  }

  recoverLocation(): void {
    this.locationService.recoverLocation(this.location.id).subscribe({
      next: (response) => {
        if (response.code === 200) {
          this.location.deleted = false;
        }
      },
      error: (err) => {
        console.error('Failed to show Location:', err);
      },
    });
  }
}
