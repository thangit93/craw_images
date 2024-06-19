### Start with docker-compose
```
docker compose up -d
docker compose exec node yarn install
```

### Crawl data from `taphuan` & `hoc10`
````
docker compose exec node yarn {service} {link}
````
Example: 
```
docker compose exec node yarn taphuan https://taphuan.nxbgd.vn/#/training-course-detail/b0487bac-a305-079d-9e23-7ddc4ff57e4a`
```

### Crawl data using csv file:
Create file csv follow this [sample csv](https://raw.githubusercontent.com/thangit93/craw_images/master/sample_download.csv)
````
cp sample_download.csv download.csv
docker compose exec node yarn process
````
