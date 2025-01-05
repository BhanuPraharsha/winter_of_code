import { Component, OnInit } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { MetricsService } from '../metrics.service';
@Component({
  selector: 'metrics',
  templateUrl: './metrics.component.html',
  styleUrls: ['./metrics.component.css']
})

export class MetricsComponent implements OnInit {
  trafficByProtocol: any = { labels: [], datasets: [] };
  topSourceIps: any = { labels: [], datasets: [] };
  topDestinationIps: any = { labels: [], datasets: [] };
  packetCountByTime: any = { labels: [], datasets: [] };
  portUsageTcp: any = { labels: [], datasets: [] };
  portUsageUdp: any = { labels: [], datasets: [] };
  totalTrafficVolume: number = 0;
  constructor(private metrics: MetricsService) { }
  ngOnInit() {
    this.fetchMetrics();
  }
  fetchMetrics()
  {
    this.trafficByProtocolFun();
    this.topSourceIpsFun();
    this.topDestinationIpsFun();
    this.packetCountByTimeFun() ;
    this.portUsageTcpFun();
    this.portUsageUdpFun();
    this.totalTrafficVolumeFun();
  }

  trafficByProtocolFun() {
    this.metrics.trafficByProtocol().subscribe((data: any) => {

      this.trafficByProtocol = {
        labels: data.map((item: any) => item.label),
        datasets: [
          {
            label: 'Packet Count',
            data: data.map((item: any) => item.packet_count),
            backgroundColor: '#42A5F5',
          },
          {
            label: 'Total Payload Size (bytes)',
            data: data.map((item: any) => item.total_payload_size),
            backgroundColor: '#66BB6A',
          }
        ]
      }
    });
  }
  topSourceIpsFun() {
    this.metrics.topSourceIps().subscribe((data: any) => {

      this.topSourceIps = {
        labels: data.map((item: any) => item.label),
        datasets: [
          {
            label: 'Packet Count',
            data: data.map((item: any) => item.packet_count),
            backgroundColor: '#42A5F5',
          },
          {
            label: 'Total Payload Size (bytes)',
            data: data.map((item: any) => item.total_payload_size),
            backgroundColor: '#66BB6A',
          }
        ]
      }
    });
  }
  topDestinationIpsFun() {
    this.metrics.topDestinationIps().subscribe((data: any) => {
      this.topDestinationIps = {
        labels: data.map((item: any) => item.label),
        datasets: [
          {
            label: 'Packet Count',
            data: data.map((item: any) => item.packet_count),
            backgroundColor: '#8E24AA',
          },
          {
            label: 'Total Payload Size (bytes)',
            data: data.map((item: any) => item.total_payload_size),
            backgroundColor: '#FF8A65',
          }
        ]
      }
    }
    );
  }
  packetCountByTimeFun() {
    this.metrics.packetCountByTime().subscribe((data: any) => {
      this.packetCountByTime = {
        labels: data.map((item: any) => item.label),
        datasets: [
          {
            label: 'Packet Count',
            data: data.map((item: any) => item.packet_count),
            fill: false,
            borderColor: '#42A5F5',
            tension: 0.1
          },
          {
            label: 'Total Payload Size (bytes)',
            data: data.map((item: any) => item.total_payload_size),
            fill: false,
            borderColor: '#66BB6A',
            tension: 0.1
          }
        ]
      };
    });
  }
  portUsageTcpFun() {
    this.metrics.portUsageTcp().subscribe((data: any) => {
      this.portUsageTcp = {
        labels: data.map((item: any) => `${item.label}`),
        datasets: [
          {
            label: 'Packet Count',
            data: data.map((item: any) => item.packet_count),
            backgroundColor: '#FFEB3B',
          },
          {
            label: 'Total Payload Size (bytes)',
            data: data.map((item: any) => item.total_payload_size),
            backgroundColor: '#8E24AA',
          }
        ]
      };
    });
  }
  portUsageUdpFun() {
    this.metrics.portUsageTcp().subscribe((data: any) => {
      this.portUsageUdp = {
        labels: data.map((item: any) => `${item.label}`),
        datasets: [
          {
            label: 'Packet Count',
            data: data.map((item: any) => item.packet_count),
            backgroundColor: '#FF7043',
          },
          {
            label: 'Total Payload Size (bytes)',
            data: data.map((item: any) => item.total_payload_size),
            backgroundColor: '#66BB6A',
          }
        ]
      };
    });
  }
  totalTrafficVolumeFun() {
    this.metrics.portUsageTcp().subscribe((data: any) => {
      this.totalTrafficVolume = data.total_payload_size;
    })
  }



}
