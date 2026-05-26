package com.tonefinder

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class ToneFinderApplication

fun main(args: Array<String>) {
	runApplication<ToneFinderApplication>(*args)
}
