import { Injectable } from '@nestjs/common';
import { Appliance } from './interfaces/appliance.interface';

@Injectable()
export class ApplianceService {
  private readonly minioBaseUrl = 'http://localhost:9000/appliances';

  private appliances: Appliance[] = [
    {
      id: 1,
      deviceName: 'Электрический чайник',
      description: 'Стеклянный чайник с быстрой закипаемостью',
      fullDescription:
        'Электрический чайник объемом 1.7 л с корпусом из нержавеющей стали, автоотключением при закипании и защитой от включения без воды.',
      powerWatts: 2200,
      category: 'Кухонная техника',
      image: 'kettle.png',
      video: 'kettle.mp4',
      status: 'published',
      likes: [101, 102, 103],
    },
    {
      id: 2,
      deviceName: 'Микроволновка',
      description: 'Компактная микроволновая печь с грилем',
      fullDescription:
        'Микроволновая печь объемом 20 литров с несколькими режимами разморозки и автоматического приготовления пищи.',
      powerWatts: 800,
      category: 'Кухонная техника',
      image: 'microwave.png',
      video: 'microwave.mp4',
      status: 'published',
      likes: [101, 102, 103, 104, 105],
    },
    {
      id: 3,
      deviceName: 'Утюг',
      description: 'Паровой утюг с керамической подошвой',
      fullDescription:
        'Мощный паровой утюг с системой защиты от накипи, функциями вертикального отпаривания и противокапельной системой.',
      powerWatts: 2000,
      category: 'Уход за одеждой',
      image: 'flatiron.png',
      video: 'flatiron.mp4',
      status: 'published',
      likes: [101, 102],
    },
    {
      id: 4,
      deviceName: 'Холодильник',
      description: 'Двухкамерный холодильник No Frost',
      fullDescription:
        'Вместительный двухкамерный холодильник с системой сухой заморозки No Frost, инверторным компрессором и зонами свежести.',
      powerWatts: 200,
      category: 'Крупная бытовая техника',
      image: 'fridge.png',
      video: 'fridge.mp4',
      status: 'published',
      likes: [101, 102, 103, 104, 105, 106, 107, 108],
    },
    {
      id: 5,
      deviceName: 'Вентилятор',
      description: 'Напольный вентилятор с пультом ДУ',
      fullDescription:
        'Тихий напольный вентилятор с регулировкой высоты, 3 скоростями обдува, таймером и поворотным механизмом на 90 градусов.',
      powerWatts: 45,
      category: 'Климатическая техника',
      image: 'fan.png',
      video: 'fan.mp4',
      status: 'published',
      likes: [101, 102, 103, 104],
    },
    {
      id: 6,
      deviceName: 'Черновой прибор',
      description: 'Новое устройство в разработке',
      fullDescription: 'Черновое описание прибора для страницы редактирования.',
      powerWatts: 500,
      category: 'Разное',
      image: 'draft.png',
      video: 'draft.mp4',
      status: 'draft', // Единственный черновик по ТЗ
      likes: [],
    },
    {
      id: 7,
      deviceName: 'Удаленный обогреватель',
      description: 'Удаленная модель',
      fullDescription: 'Данный прибор не отображается в каталоге.',
      powerWatts: 1500,
      category: 'Климат',
      image: 'heater.png',
      video: 'heater.mp4',
      status: 'deleted', // Удаленный прибор (не отображается)
      likes: [],
    },
  ];

  private formatAppliance(appliance: Appliance) {
    return {
      ...appliance,
      imageUrl: `${this.minioBaseUrl}/${appliance.image}`,
      videoUrl: `${this.minioBaseUrl}/${appliance.video}`,
      likesCount: appliance.likes.length,
    };
  }

  getFeedAppliance(id: number, next?: boolean) {
    const published = this.appliances.filter((a) => a.status === 'published');
    if (published.length === 0) return null;

    let currentIndex = published.findIndex((a) => a.id === id);
    if (currentIndex === -1) currentIndex = 0;

    if (next) {
      currentIndex = (currentIndex + 1) % published.length;
    }

    const currentAppliance = published[currentIndex];
    const nextAppliance = published[(currentIndex + 1) % published.length];

    return {
      appliance: this.formatAppliance(currentAppliance),
      nextId: nextAppliance.id,
      hasNext: published.length > 1,
    };
  }

  getDraft() {
    const draft = this.appliances.find((a) => a.status === 'draft');
    return draft ? this.formatAppliance(draft) : null;
  }

  getCatalog(powerMin?: number) {
    let list = this.appliances.filter((a) => a.status === 'published');

    if (powerMin !== undefined && !isNaN(powerMin)) {
      list = list.filter((a) => a.powerWatts >= powerMin);
    }

    return {
      appliances: list.map((a) => this.formatAppliance(a)),
      totalCount: list.length,
    };
  }
}
